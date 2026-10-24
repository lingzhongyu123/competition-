# LongMemEval 原始数据取得记录

2026-10-24：官方 longmemeval_oracle.json 已下载并成功解析，共 500 条，15,388,478 字节。

来源：https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned

版本：98d7416c24c778c2fee6e6f3006e7a073259d48f

SHA-256：821a2034d219ab45846873dd14c14f12cfe7776e73527a483f9dac095d38620c

## 初步展示样本

| 类型 | question_id | 问题原文 | 证据会话数 |
|---|---|---|---|
| single-session-user | e47becba | What degree did I graduate with? | 1 |
| single-session-preference | 8a2466db | Can you recommend some resources where I can learn more about video editing? | 1 |
| knowledge-update | 6a1eabeb | What was my personal best time in the charity 5K run? | 2 |
| temporal-reasoning | gpt4_2655b836 | What was the first issue I had with my new car after its first service? | 3 |

以上是按类型选出的真实候选，尚未完成逐轮证据标注，也未接入页面；实际演示 UI 仍使用原 MOCK 故事。

oracle 只包含证据会话，不代表 S/M 完整长历史。尚未运行模型、记忆系统、DSH 或评分。answer、answer_session_ids 和 has_answer 属于评测侧信息，不作为运行时记忆或提示词输入。

原始文件保存在本地 outputs/LongMemEval/longmemeval_oracle.json。GitHub 保存来源、哈希和可复现下载脚本；不重复托管整份上游数据。使用 scripts/download-longmemeval.ps1 可下载固定版本并检查哈希。

## 后续进展

四个候选样本已整理成[真实样本逐例说明](LongMemEval-真实样本逐例说明.md)和根目录的 [LongMemEval-真实样本导览.html](../LongMemEval-真实样本导览.html)。导览保留 7 个原始会话，可从重点摘录定位完整会话。中文说明为人工整理，不代表系统写入或检索。原 MOCK 控制台仍未替换数据。

导览生成成功；未完成浏览器视觉或交互验证。下载仓库 ZIP 并解压后，可双击根目录导览 HTML 查看。
