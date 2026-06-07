/**
 * SoulForge — 灵魂打印机 v2.0
 *
 * P0-P2 全修版，兼容新版 OpenClaw Plugin SDK
 *
 * © 2026 iLang Inc., Canada. MIT License.
 */

import { homedir } from "os";
import { writeFileSync, readFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const SAMPLING_DEFAULT = 50000;

// 暂存预览内容，确保确认时写入的和预览的是同一份
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

function buildDistillPrompt(corpus: string, source: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `你是一台表达指纹蒸馏机。以下是来自"${source}"的写作语料。
请分析这些文字，提取7个维度的写作特征。

语料：
---
${corpus}
---

请严格按以下I-Lang GENE格式输出，不要输出任何其他内容：

::ILANG::v4.0
[TYPE:soul]
[SOURCE:蒸馏自${source}]
[DATE:${today}]

::GENE{opening|style:____}
  T:分析此人的开头习惯

::GENE{vocabulary|fingerprint:____,____,____|never:____,____}
  fingerprint：高频特征词/口头禅
  never：从不使用的表达

::GENE{rhythm|avg_para_lines:____|pattern:____}

::GENE{question|freq:____|style:____}

::GENE{ending|style:____}

::GENE{tone|style:____}

::GENE{audience|profile:____}

只输出I-Lang GENE格式内容。`;
}

function resolveSoulPath(api: any): string {
  // P0-5: 写入 workspace SOUL.md，不是 ~/.openclaw/soul.md
  try {
    if (api?.runtime?.agent?.resolveAgentWorkspaceDir) {
      const workspaceDir = api.runtime.agent.resolveAgentWorkspaceDir(api.config);
      return join(workspaceDir, "SOUL.md");
    }
  } catch { /* fallback */ }

  // Fallback: 尝试常见路径
  const workspacePath = join(homedir(), ".openclaw", "workspace", "SOUL.md");
  if (existsSync(join(homedir(), ".openclaw", "workspace"))) {
    return workspacePath;
  }
  return join(homedir(), ".openclaw", "SOUL.md");
}

function backupAndWrite(soulPath: string, content: string): { success: boolean; backedUp: boolean; backupPath: string } {
  try {
    const dir = join(soulPath, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    let backedUp = false;
    let backupPath = "";

    if (existsSync(soulPath)) {
      // P1-10: 备份带时间戳
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      backupPath = `${soulPath}.bak.${ts}`;
      copyFileSync(soulPath, backupPath);
      backedUp = true;
    }

    writeFileSync(soulPath, content, "utf-8");
    return { success: true, backedUp, backupPath };
  } catch {
    return { success: false, backedUp: false, backupPath: "" };
  }
}

// P1-8: 标准 ToolResult 格式
function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// P1-7: LLM调用兼容层
async function callLLM(api: any, prompt: string): Promise<string> {
  // 优先用新版 API
  if (api?.runtime?.agent?.runEmbeddedAgent) {
    try {
      const result = await api.runtime.agent.runEmbeddedAgent({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      return result?.content || result?.text || "";
    } catch { /* fallback */ }
  }

  // Fallback: 旧版 api.llm.complete
  if (api?.llm?.complete) {
    try {
      const result = await api.llm.complete({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });
      return result?.content || result?.text || "";
    } catch { /* fallback */ }
  }

  return "";
}

export default function register(api: any) {
  // P1-9: 读取配置
  const samplingSize = api?.pluginConfig?.samplingSize || SAMPLING_DEFAULT;

  // P0-2/3: 新版 registerTool 签名
  api.registerTool({
    // P2-14: 加 soulforge_ 前缀
    name: "soulforge_distill_corpus",
    description: "语料模式蒸馏：用户粘贴文本，蒸馏写作风格。展示预览，用户确认后写入SOUL.md（自动备份旧版本）。语料通过用户配置的模型提供商进行分析。",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "用户粘贴的文本内容。",
        },
        source: {
          type: "string",
          description: "语料来源描述（文件名或人名）",
        },
        confirmed: {
          type: "boolean",
          description: "用户是否已确认写入。首次调用传false展示预览，用户确认后传true执行写入。",
        },
      },
      required: ["text", "source"],
    },
    // P0-3: 新版 execute 签名
    execute: async (_toolCallId: string, params: { text: string; source: string; confirmed?: boolean }) => {
      const { text, source, confirmed } = params;

      if (!text || text.trim().length < 500) {
        return textResult("语料太短（不足500字），无法蒸馏出可靠的写作风格。请提供更多内容。");
      }

      const cacheKey = `corpus_${source}`;

      if (!confirmed) {
        // 第一次：蒸馏 + 预览 + 暂存
        const sampled = sampleCorpus(text, samplingSize);
        const prompt = buildDistillPrompt(sampled, source);
        const soulContent = await callLLM(api, prompt);

        if (!soulContent.includes("::ILANG::v4.0")) {
          return textResult("蒸馏失败：输出格式不符合预期。请重试。");
        }

        // P0-6: 暂存预览内容
        previewCache.set(cacheKey, soulContent);

        // P0-15: 输出目标路径信息
        const soulPath = resolveSoulPath(api);

        const privacyNotice = `【数据说明】你提供的语料将通过你配置的中转站发送给AI模型进行风格分析。处理方式取决于你选择的模型提供商的隐私政策。如果语料包含敏感信息，建议先脱敏后再投喂。`;

        return textResult(`${privacyNotice}

【蒸馏预览】以下是从「${source}」提取的写作风格：

${soulContent}

【写入信息】
• 目标路径：${soulPath}
• 备份策略：写入前自动备份为 SOUL.md.bak.{时间戳}

确认使用这个风格吗？回复"确认"执行写入。`);
      }

      // 第二次：确认写入（P0-6: 用暂存的预览内容，不重新生成）
      const cachedContent = previewCache.get(cacheKey);
      if (!cachedContent) {
        return textResult("未找到预览内容，请重新运行蒸馏。");
      }

      const soulPath = resolveSoulPath(api);
      const { success, backedUp, backupPath } = backupAndWrite(soulPath, cachedContent);

      // 写入后清除缓存
      previewCache.delete(cacheKey);

      if (success) {
        const backupMsg = backedUp ? `\n旧版本已备份为：${backupPath}` : "";
        return textResult(`你的写作风格已经跟${source}一致，随时可以再次替换为其他风格。${backupMsg}\n\n写入路径：${soulPath}`);
      } else {
        return textResult(`蒸馏完成，但写入SOUL.md失败。以下是你的IP人设卡，请手动保存到 ${soulPath}：\n\n${cachedContent}`);
      }
    },
  });

  api.registerTool({
    // P2-11/14: 改名为 guide，加前缀
    name: "soulforge_distill_search",
    description: "搜索引导模式：输入人名，引导用户用搜索skill采集资料后调用soulforge_distill_corpus蒸馏。本工具不直接搜索，只提供采集指引。",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "要蒸馏的人物名称",
        },
      },
      required: ["name"],
    },
    execute: async (_toolCallId: string, params: { name: string }) => {
      const { name } = params;

      return textResult(`准备蒸馏「${name}」的写作风格。

本工具提供采集指引，不直接执行搜索。请先用搜索工具采集以下内容：

1. 此人的公开文章、博客、长文（至少10篇）
2. 此人的社交媒体发言（微博/X/即刻等）
3. 此人的演讲或访谈文字稿（如有）

【数据说明】采集到的文本将通过你配置的中转站发送给AI模型进行风格分析。处理方式取决于你选择的模型提供商的隐私政策。

采集完成后，把所有文本内容汇总，然后调用 soulforge_distill_corpus 工具进行蒸馏。

提示：
• 如果你安装了搜索类skill，可以直接使用
• 采集的内容越多越好，至少需要5000字以上`);
    },
  });
}
