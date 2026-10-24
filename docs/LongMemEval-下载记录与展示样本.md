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
