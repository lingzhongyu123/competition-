# CenYangtze 仓库筛选与快照导出

日期：2026-10-26。读取 GitHub 公开仓库列表及相关 README/源码，不涉及私人运行数据或上游写入。

## 找到哪些可用内容

主页公开仓库列表本次列出四个仓库：

| 仓库 | 本次读取版本 | 与 Console 的关系 |
|---|---|---|
| [dsh-advanced-mem-plugin](https://github.com/CenYangtze/dsh-advanced-mem-plugin) | f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a | 直接需要：经验引擎、snapshot、文件及 DSH 存储提供器、OSWorld 运行器和 HTTP bridge、插件客户端入口 |
| [MAGFold](https://github.com/CenYangtze/MAGFold) | fc5818f4a8f872de0d8f41c40eb96be14e3a9183 | 可参考原子交互图、经验块和展开方式。README 的运行产物是 MAGFold 图与索引，不能直接按 ExperienceSnapshot v1 导入 |
| [llm-api-quality-checker](https://github.com/CenYangtze/llm-api-quality-checker) | 6cde7f0fce3db1d452bb78d27bf7d14012ae871e | 用于模型 API 连通性与并发测试，不提供 Memory 经验或 OSWorld 运行记录 |
| [tilelang-puzzles](https://github.com/CenYangtze/tilelang-puzzles) | e56b226286dc6b0f5eea5cdaf897a1c39fb41dd5 | GPU 内核练习，与当前接入无直接关系 |

本次最需要的源码已在第一个仓库找到；该仓库不是团队实际部署和私人数据的证明。未在公开仓库中取得可作为本项目真实运行证据的快照，也未将测试 fixture 当真实数据。

## 两种导出方式

新增 `scripts/export-experience-snapshot.mjs`，无新依赖。输出是网页已支持的完整 JSON，不改写状态、来源或置信度，不自动提升为“已验证”。数据提供方应只选择获准分享的 scope，并先在本地审阅原文。

### 1. 已有独立 API 文件存储

上游 `src/experience/store.ts` 的 FileExperienceStore 按 SHA-256(scope) 命名文件，并原子替换完整快照。工具只读取指定作用域的那一个文件，不遍历目录、不取得写锁、不调用维护、提炼或写入 API。

```sh
node scripts/export-experience-snapshot.mjs --store /path/to/experience-store --scope EXACT_SCOPE --output .local/exports/experience-snapshot.json
```

路径和 scope 均需替换为实际值。该方式不适用于 DSH storage-domain，也不接受 OSWorld trajectory、manifest 或评测报告。已有完整快照可用 `--input /path/to/snapshot.json` 代替 `--store`，检查后复制到新文件。

### 2. 已运行 DSH 宿主

在已有且获授权的服务端上下文中调用下面的导出函数。该片段需嵌入实际宿主代码，不能作为脱离 ctx 的独立启动命令：

```js
import { exportFromExperienceMemory } from '/absolute/path/to/Memory-Console/scripts/export-experience-snapshot.mjs';

const receipt = await exportFromExperienceMemory(ctx.experience.memory, {
  scope: authorizedScope,
  output: '/absolute/private/path/experience-snapshot.json',
});
```

该函数只调用 `memory.snapshot(scope)`。scope 的授权由宿主保证，导出函数不提供登录或权限管理，不扫描其他 scope。没有数据时，上游 snapshot 可能返回空快照；空快照不等于已采集任务。

`/experience export <skill-id>` 在当前上游导出单条 Skill Markdown，不是本页面所需完整 JSON，不能直接拿来导入。

## 网页查看

1. 打开根目录 `双击打开演示.html`，进入“经验快照”。
2. 选择导出的 JSON 文件，查看策略、来源任务、修订与反馈。
3. 看到“本地导入 · 来源未核验”属于预期；成功导入只表示符合展示结构。
4. 源数据与导出文件不上传仓库。推荐放在忽略目录 `.local/`；工具不上传数据，也不自动脱敏。替换 ID 时必须同步引用。

5 MiB 上限及字段检查复用网页导入器。输出文件必须不存在，拒绝覆盖已有导出。输出回执含文件 SHA-256、各集合数量与引用警告，不打印记录原文。它不代替上游完整 Schema 或证据校验。

## 仍需要的数据

本机未发现已配置的 dsh 命令；尚未取得团队运行的授权作用域和真实存储路径。真实导出需数据拥有者提供一个可分享 scope 的存储副本，或在已运行宿主中执行上述函数。无需分享模型 API Key、认证 token 或整个私人数据库。

本轮工具验证使用隔离的合成快照，未连接真实 DSH/Memory/OSWorld；不能将其称为真实运行展示完成。
