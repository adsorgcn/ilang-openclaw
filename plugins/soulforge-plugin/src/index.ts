/**
 * SoulForge — 灵魂打印机 v3.0
 *
 * 三步法蒸馏算法：观察事实→推理性格→验证表达→输出GENE(WHAT+WHY+EVIDENCE+CONFIDENCE)
 *
 * © 2026 iLang Inc., Canada. MIT License.
 */

import { randomUUID } from "crypto";
import { homedir } from "os";
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const SAMPLING_DEFAULT = 50000;
const previewCache = new Map<string, string>();

function sampleCorpus(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const third = Math.floor(limit / 3);
  const front = text.slice(0, third);
  const midStart = Math.floor(text.length / 2 - third / 2);
  const middle = text.slice(midStart, midStart + third);
  const back = text.slice(-third);
  return `${front}\n\n[...中段采样...]\n\n${middle}\n\n[...后段采样...]\n\n${back}`;
}

/**
 * 三步法蒸馏Prompt
 */
function buildDistillPrompt(corpus: string, source: string, bioFacts: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `你是一台灵魂蒸馏机。用三步法从语料中提取此人的完整表达DNA。

目标人物：${source}

${bioFacts ? `【传记事实（来自百科）】\n${bioFacts}\n` : ""}
【写作语料】
---
${corpus}
---

请严格按三步法执行：

**第一步：观察（列出所有事实，不判断）**

A. 传记事实（如果上方提供了百科信息）：
   - 生日→星座
   - 出生地→地域文化
   - 家庭背景→阶层
   - 教育经历→知识结构
   - 职业路径→核心领域
   - 关键人生事件→转折点

B. 表达事实（从语料中直接统计）：
   - 开头方式分布
   - 高频词TOP20和从不用的词
   - 平均段落长度和长短段交替模式
   - 反问句频率和风格
   - 结尾方式分布
   - 句式特征

**第二步：推理（事实→假设→用语料验证）**

从传记事实产生性格假设，然后用语料验证：
- 假设被语料验证 → confidence:HIGH
- 假设被语料部分验证 → confidence:MEDIUM
- 假设未被语料验证 → 丢弃，不写入
- 语料中直接观察到的特征（不需要假设）→ confidence:HIGH
- 假设有但语料不足以验证 → confidence:LOW

权重：一手语料100% > 行为事实70% > 传记事实30% > 星座推断15%
冲突时语料说了算，推断让路。

**第三步：输出（严格按以下I-Lang GENE格式，不要输出其他任何内容）**

::ILANG::v4.0
[TYPE:soul]
[SOURCE:蒸馏自${source}]
[DATE:${today}]

[IDENTITY]
  NAME: ${source}
  ZODIAC: （从生日推算，没有传记信息则写"未知"）
  BACKGROUND: （一句话概括此人背景）
  CORE_TRAIT: （经验证的1-3个核心性格特质）

::GENE{opening|style:____|confidence:HIGH/MEDIUM/LOW}
  T: 此人的开头习惯（WHAT）
  WHY: 为什么这样开头（从传记/性格推断，没有则省略）
  EVIDENCE: 语料中的具体例子

::GENE{vocabulary|fingerprint:____,____,____|never:____,____|confidence:HIGH/MEDIUM/LOW}
  T: 高频特征词和从不用的词
  WHY: 用词习惯的成因
  EVIDENCE: 具体出现次数或语料片段

::GENE{rhythm|avg_para_lines:____|pattern:____|confidence:HIGH/MEDIUM/LOW}
  T: 段落节奏特征
  WHY: 节奏习惯的成因
  EVIDENCE: 语料中的典型段落

::GENE{question|freq:____|style:____|confidence:HIGH/MEDIUM/LOW}
  T: 反问句使用特征
  WHY: 反问风格的成因
  EVIDENCE: 具体反问句例子

::GENE{ending|style:____|confidence:HIGH/MEDIUM/LOW}
  T: 结尾习惯
  WHY: 结尾风格的成因
  EVIDENCE: 语料中的结尾例子

::GENE{tone|style:____|confidence:HIGH/MEDIUM/LOW}
  T: 整体视角立场
  WHY: 为什么形成这种立场
  EVIDENCE: 体现立场的语料片段

::GENE{audience|profile:____|confidence:HIGH/MEDIUM/LOW}
  T: 目标读者画像
  WHY: 从称呼/假设/用语推断
  EVIDENCE: 语料中指向读者的表达

[META]
  FACTS_USED: 使用了多少条传记事实
  HYPOTHESES_TESTED: 测试了多少条假设
  HYPOTHESES_VERIFIED: 验证通过了多少条
  CONFIDENCE_DISTRIBUTION: HIGH:X / MEDIUM:X / LOW:X

只输出上面的I-Lang格式内容。每个GENE的WHY和EVIDENCE尽量填写，填不了的省略该行。`;
}

function resolveSoulPath(api: any): string {
  try {
    if (api?.runtime?.agent?.resolveAgentWorkspaceDir) {
      return join(api.runtime.agent.resolveAgentWorkspaceDir(api.config), "SOUL.md");
    }
  } catch (err) {
    log(api, "warn", "resolveAgentWorkspaceDir failed", err);
  }
  const wsPath = join(homedir(), ".openclaw", "workspace", "SOUL.md");
  if (existsSync(join(homedir(), ".openclaw", "workspace"))) return wsPath;
  return join(homedir(), ".openclaw", "SOUL.md");
}

function backupAndWrite(api: any, soulPath: string, content: string): { success: boolean; backedUp: boolean; backupPath: string } {
  try {
    const dir = dirname(soulPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    let backedUp = false;
    let backupPath = "";
    if (existsSync(soulPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      backupPath = `${soulPath}.bak.${ts}`;
      copyFileSync(soulPath, backupPath);
      backedUp = true;
    }
    writeFileSync(soulPath, content, "utf-8");
    return { success: true, backedUp, backupPath };
  } catch (err) {
    log(api, "error", "backupAndWrite failed", err);
    return { success: false, backedUp: false, backupPath: "" };
  }
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function log(api: any, level: string, msg: string, err?: any) {
  const fn = api?.logger?.[level] || api?.logger?.info || console.log;
  fn(err ? `[SoulForge] ${msg}: ${String(err)}` : `[SoulForge] ${msg}`);
}

async function callLLM(api: any, prompt: string): Promise<string> {
  if (api?.runtime?.agent?.runEmbeddedAgent) {
    try {
      const cfg = api.config;
      const runId = randomUUID();
      const agentDir = api.runtime.agent.resolveAgentDir
        ? api.runtime.agent.resolveAgentDir(cfg)
        : join(homedir(), ".openclaw");
      const workspaceDir = api.runtime.agent.resolveAgentWorkspaceDir
        ? api.runtime.agent.resolveAgentWorkspaceDir(cfg)
        : join(homedir(), ".openclaw", "workspace");
      const timeoutMs = api.runtime.agent.resolveAgentTimeoutMs
        ? api.runtime.agent.resolveAgentTimeoutMs(cfg)
        : 120000;
      const sessionsDir = join(agentDir, "sessions");
      if (!existsSync(sessionsDir)) mkdirSync(sessionsDir, { recursive: true });

      const defaultModel =
        api?.runtime?.agent?.defaults?.model ||
        cfg?.agents?.defaults?.model ||
        cfg?.models?.default ||
        undefined;

      const params: any = {
        sessionId: `soulforge:${runId}`,
        runId,
        sessionFile: join(sessionsDir, `soulforge-${runId}.jsonl`),
        workspaceDir,
        prompt,
        timeoutMs,
      };

      if (defaultModel) {
        if (typeof defaultModel === "string" && defaultModel.includes("/")) {
          const [provider, model] = defaultModel.split("/", 2);
          params.provider = provider;
          params.model = model;
        } else {
          params.model = defaultModel;
        }
        log(api, "info", `Using model: ${defaultModel}`);
      }

      const res = await api.runtime.agent.runEmbeddedAgent(params);
      const text = extractText(res);
      log(api, "info", `runEmbeddedAgent returned ${text.length} chars`);
      return text;
    } catch (err) {
      log(api, "error", "runEmbeddedAgent failed", err);
    }
  }

  if (api?.llm?.complete) {
    try {
      const res = await api.llm.complete({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      const text = res?.content || res?.text || extractText(res);
      log(api, "info", `llm.complete returned ${text.length} chars`);
      return text;
    } catch (err) {
      log(api, "error", "llm.complete failed", err);
    }
  }

  log(api, "error", "No LLM interface available");
  return "";
}

function extractText(r: any): string {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (r.content && Array.isArray(r.content)) return r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
  return r.text || "";
}

export default function register(api: any) {
  const samplingSize = api?.pluginConfig?.samplingSize || SAMPLING_DEFAULT;
  log(api, "info", `SoulForge loaded. samplingSize=${samplingSize}`);

  // ========== 语料模式 ==========
  api.registerTool({
    name: "soulforge_distill_corpus",
    description: "三步法蒸馏：接收文本语料（和可选的百科传记信息），用观察→推理→输出三步法提取表达DNA。展示预览，用户确认后写入SOUL.md。",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "文本语料内容" },
        source: { type: "string", description: "语料来源（人名）" },
        bio: { type: "string", description: "可选。从百科采集的传记信息（生日、教育、职业等事实）。有此字段时蒸馏算法会用三步法的完整推理链。" },
        confirmed: { type: "boolean", description: "false=预览，true=确认写入" },
      },
      required: ["text", "source"],
    },
    execute: async (_toolCallId: string, params: { text: string; source: string; bio?: string; confirmed?: boolean }) => {
      const { text, source, bio, confirmed } = params;

      if (!text || text.trim().length < 500) {
        return textResult("语料太短（不足500字），请提供更多内容。");
      }

      const cacheKey = `corpus_${source}`;

      if (!confirmed) {
        log(api, "info", `Distilling "${source}", ${text.length} chars corpus, ${bio?.length || 0} chars bio`);
        const sampled = sampleCorpus(text, samplingSize);
        const prompt = buildDistillPrompt(sampled, source, bio || "");
        const soulContent = await callLLM(api, prompt);

        if (!soulContent.trim()) {
          return textResult("蒸馏失败：LLM没有返回内容。请查看插件日志确认LLM接口是否可用。");
        }

        if (!soulContent.includes("::ILANG::v4.0")) {
          return textResult(`蒸馏失败：LLM输出格式不符合预期。\n\n原始输出前500字：\n${soulContent.slice(0, 500)}`);
        }

        previewCache.set(cacheKey, soulContent);
        const soulPath = resolveSoulPath(api);

        return textResult(`【数据说明】语料通过你配置的中转站发送给AI模型分析。

【蒸馏预览】从「${source}」用三步法提取的表达DNA：

${soulContent}

【写入信息】
• 目标：${soulPath}
• 备份：SOUL.md.bak.{时间戳}

确认？回复"确认"写入。`);
      }

      const cached = previewCache.get(cacheKey);
      if (!cached) return textResult("未找到预览内容，请重新蒸馏。");

      const soulPath = resolveSoulPath(api);
      const { success, backedUp, backupPath } = backupAndWrite(api, soulPath, cached);
      previewCache.delete(cacheKey);

      if (success) {
        const bMsg = backedUp ? `\n旧版本备份：${backupPath}` : "";
        return textResult(`你的写作风格已经跟${source}一致，随时可以再次替换为其他风格。${bMsg}\n写入：${soulPath}`);
      }
      return textResult(`写入失败。请手动保存到 ${soulPath}：\n\n${cached}`);
    },
  });

  // ========== 搜索模式 ==========
  api.registerTool({
    name: "soulforge_distill_search",
    description: "搜索蒸馏模式：输入人名，返回结构化采集任务。agent执行采集后，把传记信息和语料一起传给 soulforge_distill_corpus 完成三步法蒸馏。",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "要蒸馏的人物名称" },
      },
      required: ["name"],
    },
    execute: async (_toolCallId: string, params: { name: string }) => {
      const { name } = params;
      log(api, "info", `Search mode initiated for "${name}"`);

      return textResult(`【SoulForge 三步法蒸馏任务】

目标人物：${name}

【使用声明】采集内容仅用于分析此人的写作风格特征（词频、句式、节奏等统计性特征），不复制、不存储、不再发布原文。蒸馏输出的SOUL.md只包含风格描述和少量例句引用，不包含原始语料。

请你（agent）分两阶段采集，然后调用蒸馏工具。

**阶段一：传记事实采集（百科优先）**

第1轮搜索：「${name} 维基百科」—— 提取传记事实（生日、教育、职业、关键事件）
第2轮搜索：「${name} 百度百科」—— 补充传记事实

只提取事实性信息（生日、经历、著作列表），不需要复制百科全文。整理成一段传记摘要备用。

**阶段二：一手语料采集（用于风格分析）**

第3轮搜索：「${name} 原文 全文」—— 此人写的文章、书籍片段
第4轮搜索：「${name} 语录 名言」—— 高频表达、口头禅
第5轮搜索：「${name} 演讲 访谈」—— 对话、问答

采集此人本人产出的文字，用于统计写作风格特征。优先采集公共领域或此人主动公开发表的内容。

**阶段三：调用蒸馏**

采集完成后，调用 soulforge_distill_corpus：
  text: 阶段二采集的语料
  source: "${name}"
  bio: 阶段一整理的传记摘要
  confirmed: false

目标：语料至少5000字，传记摘要至少500字。`);
    },
  });
}
