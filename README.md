# I-Lang OpenClaw 技能库 — 腾讯 SkillHub 版

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Skills](https://img.shields.io/badge/技能-9个已发布-blue)](#技能列表)
[![Protocol](https://img.shields.io/badge/I--Lang-v4.0-purple)](https://ilang.ai)

> 本仓库是 [ilang-ai/ilang-openclaw](https://github.com/ilang-ai/ilang-openclaw) 的腾讯 SkillHub 发布分支。
>
> 仅包含纯文本技能（SKILL.md + prompt.md），推送到 main 自动发布到[腾讯 SkillHub](https://skillhub.cn)。
>
> 所有技能遵循 I-Lang Spec v4.0 格式。复制 prompt.md 到任何AI即可使用。

---

## 技能列表

| 技能 | 版本 | 说明 |
|------|------|------|
| **Niche-Awesome** | v1.0.0 | 解决新手做产品不知道做什么的痛点。6步调研流程，3小时出完整BRD调研报告 |
| **DeAI** | v1.1.3 | 去AI味编辑器。三层处理：删指纹词→标口语位→调节奏。支持中英日韩 |
| **WeChat-Awesome** | v1.0.0 | 微信公众号写作助手。17条写作基因+10项自查清单 |
| **freemoney** | v1.3.0 | 白拿钱。追踪美加英澳免证据集体诉讼和解金 |
| **lazarus** | v1.0.2 | 网站复活术。从Wayback Machine恢复已关闭网站的内容 |
| **everything-is-ok** | v1.0.4 | 通用提示词压缩。自然语言→I-Lang压缩语法，省40-65% token |
| **ilang-compress** | v2.3.2 | I-Lang压缩引擎。62个动词+28个修饰符+14个实体，极致压缩 |
| **less-token** | v1.0.4 | 摘要提示词压缩。冗长的摘要指令→一行I-Lang指令 |
| **no-prompt** | v1.0.2 | 不用学提示词工程。说人话→AI帮你写结构化指令 |

---

## 安装方式

**腾讯 SkillHub 用户（推荐）：**

跟你的AI说："帮我在SkillHub安装[技能名]"

**OpenClaw 用户：**

跟你的AI说："帮我在官方市场安装[技能名]技能"

**任何AI：**

打开技能目录下的 `prompt.md`，复制全文粘贴到任何AI即可使用。

---

## 技能格式

所有技能遵循 I-Lang Spec v4.0 格式：

```
::ILANG::v4.0
[ROLE:技能角色]
[TASK:任务描述]
[LANG:语言]
[VERSION:版本号]
```

每个技能目录包含两个文件：
- `SKILL.md` — 技能说明（元数据+使用方法）
- `prompt.md` — 技能核心逻辑（I-Lang v4.0格式）

---

## 生态

| 资源 | 链接 |
|------|------|
| I-Lang 协议 | [ilang.ai](https://ilang.ai) |
| AutoCode | [ilang-ai/autocode](https://github.com/ilang-ai/autocode) |
| ZeroCode | [Trae 插件](https://gitee.com/palmmedia/iLang-Trae-Plugin) |
| 干活AI | [ganhuo.ai](https://ganhuo.ai) |
| wexin.ai | [wexin.ai](https://wexin.ai) |
| 主仓库 | [ilang-ai/ilang-openclaw](https://github.com/ilang-ai/ilang-openclaw) |

---

## 自动发布

推送到 `main` 分支时，GitHub Actions 自动检测变更的技能文件，通过 SkillHub CLI 发布到腾讯 SkillHub。

---

## 许可证

MIT — **iLang Inc. / 加拿大 / 2026**
