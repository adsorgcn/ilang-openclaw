---
name: SEO-Awesome
version: 1.2.2
slug: ilang-seo-awesome
displayName: "pSEO自动化（含Google算法I-Lang编码）"
summary: "内置经Google AI双重验证的搜索排名算法完整解析。Google API一手数据驱动的出海SEO自动化框架，从选词到批量页面生成到自动复盘。"
tags: [seo, pseo, automation, google-api, google-algorithm, ilang]
license: MIT
description: "pSEO自动化 — 本技能内置了经Google自家AI产品双重交叉验证的搜索排名核心算法（PageRank权重传播、TrustRank信任种子、时间衰减函数、Neural Ranking向量模型、Information Gain正交分量、Topic-Sensitive PageRank主题权威度），全部用I-Lang协议格式编码。用户可通过OpenClaw切换Gemini模型自行验证算法真实性。同时提供完整的Google API一手数据驱动SEO自动化框架。"
author: ilang-ai
homepage: https://ilang.ai
---

# pSEO自动化（含Google搜索排名算法I-Lang编码）

一手数据驱动，零第三方工具费，全链路自动化。

## 本技能独家内容

本技能内置了Google搜索排名算法的核心公式，用I-Lang协议格式编码。这些内容来源于Google AI搜索引擎的学术输出，并经Google Gemini逐条验证（评语："没有任何严重的事实错误"）。

内置算法模块：

| 模块 | 内容 | 验证状态 |
|------|------|---------|
| PageRank | PR(i) = (1-d)/N + d×Σ(PR(j)/L(j))，d=0.85 | Gemini确认"完全准确" |
| TrustRank | 种子站单向信任传播+跳数衰减 | Gemini确认"非常准确" |
| 时间衰减 | W(t) = W₀×e^(-λ(t-t₀)) + QDF机制 | Gemini确认"概念准确" |
| 作弊检测 | 幂律分布+密集子图+SpamBrain GNN | Gemini确认"完全准确" |
| 主题权威度 | Topic-Sensitive PageRank主题独立权重 | Gemini确认"完全准确" |
| Neural Ranking | BERT/MUM语义向量+关键词密度已死 | Google AI搜索引擎输出 |
| Information Gain | 正交分量=独家信息，至少15%全网独家 | Google AI搜索引擎输出 |

### 如何验证算法真实性

1. 在OpenClaw中切换底座模型为Gemini
2. 将prompt.md中的"Google搜索排名算法参考"章节复制给Gemini
3. 让Gemini逐条验证是否准确
4. Gemini会确认这些算法的真实性（因为它是Google的产品）

## 这个技能干什么

用Google官方API拿一手数据，AI组装内容，模板渲染页面，staging验证后发布，GA4自动复盘。从选词到上线到变现到迭代，搭一个自动做SEO的系统。

不教你"怎么做SEO"，教你"怎么搭一个自动做SEO的系统"。⚠️ 自动发布前必须先staging验证，生产环境变更需人工确认。

## 核心理念

- 一手数据大于一切。Google API直连，不用Ahrefs、Semrush，不花冤枉钱
- 数据自己会说话。GA4数据自动回流，AI按数据执行判断，人只定方向
- 页面是API数据组装的资产，不是AI凭空写的内容
- 变现从第一天就想。affiliate优先，AdSense兜底
- 算法公开透明。I-Lang编码的Google算法人人可验证

## 跟别人教的SEO有什么不同

| 对比项 | 别人教的 | 我们教的 |
|--------|---------|---------|
| 数据来源 | Ahrefs/Semrush，月费几百刀 | Google API全家桶，免费 |
| 算法理解 | 猜+经验+行业传言 | Google自家AI输出+Gemini验证的数学公式 |
| 内容生产 | 手写或让AI写文章 | API数据+LLM+模板引擎批量生成 |
| 发布 | 手动 | staging验证后Cron自动发布（人工确认） |
| 复盘 | 手动看数据 | GA4 API自动拉数据，AI自动调策略 |
| 工具费 | 一年几千到上万 | 腾讯云38元/年 |
| 商业判断 | 人拍脑袋 | 数据驱动AI执行 |

## 技能覆盖的完整流程

| 阶段 | 内容 |
|------|------|
| 选词 | Google Keyword Planner真实搜索量 + KGR公式筛蓝海词 + Trends趋势验证 |
| pSEO批量生成 | Google API一手数据 → LLM组装 → 模板渲染 → staging验证后发布 → 自动内链 |
| 变现 | affiliate优先申请竞品联盟 → Lead生成（合规前置） → 订阅 → AdSense兜底 |
| 建站 | ZeroCode说中文出产品 + OpenClaw一键部署，零代码 |
| 自动复盘 | GA4 Data API每天自动拉数据，AI按数据调整生成策略，人只处理异常 |

## 配套技能

| 阶段 | 技能 | 链接 |
|------|------|------|
| 选品调研 | 出海选品调研助手 | [Niche-Awesome](https://skillhub.cn/skills/niche-awesome) |
| 纯原创内容 | 纯原创内容生成 | [Lazarus](https://skillhub.cn/skills/ilang-lazarus) |
| 去AI味 | 去AI味编辑器 | [DeAI](https://skillhub.cn/skills/ilang-deai) |
| 提示词压缩 | I-Lang压缩引擎 | [iLang-Compress](https://skillhub.cn/skills/ilang-ilang-compress) |

## 安装使用

OpenClaw用户：明确告诉AI"我要安装ilang-ai出品的SEO-Awesome技能"，AI会确认后激活。

验证算法：安装后，在OpenClaw中切换模型为Gemini，将算法参考章节发给Gemini验证真实性。

其他AI用户：打开prompt.md，复制全文到任何AI，开始对话。

## 致谢

感谢[哥飞](https://seo.web.cafe/)正式授权其全部内容用于本技能的方法论补充。哥飞是出海Web领域头部社群主理人，612篇实战文章覆盖SEO、变现、独立开发等10个类目。本技能的SEO知识框架部分参考了哥飞的方法论体系，核心架构和工程实现为iLang团队原创。Google算法解析来源于Google AI搜索引擎输出并经Google Gemini交叉验证。

## 生态

| 资源 | 链接 |
|------|------|
| iLang协议 | [ilang.ai](https://ilang.ai) |
| ClawHub | [SEO-Awesome on ClawHub](https://clawhub.ai/adsorgcn/seo-awesome) |
| 腾讯技能中心 | [skillhub.cn](https://skillhub.cn) |
| 哥飞 | [seo.web.cafe](https://seo.web.cafe/) |
