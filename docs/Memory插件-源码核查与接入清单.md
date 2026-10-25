# 新提供的 Memory 插件：接入核查与下一步

核查日期：2026-10-25。源码基线：[f840e1c](https://github.com/CenYangtze/dsh-advanced-mem-plugin/commit/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a)（master）；包版本 0.3.0。本轮只读核查上游，没有安装插件、启动模型、调用记忆写入或执行 OSWorld。上游文档中的验证结果属于上游报告，不是本机复测。

## 三个问题已有的答案

### Agent 能接 OSWorld 吗？

仓库有实现，不只是设想：[评测说明](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/docs/evaluation.zh.md)和 [osworld.ts](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/evaluation/osworld.ts)提供 loadOSWorld、runOSWorld、HttpOSWorldEnvironment。运行器向兼容 OpenAI 的模型发送任务与观察，再把动作交给 Python HTTP bridge / DesktopEnv，最后调用环境评估器。源码包含轨迹文件与逐样本报告输出。

这证明仓库有 OSWorld 评测接入代码，不能证明团队当前 DSH 会话 Agent 已端到端接通。runOSWorld 自己组织模型操作循环；不能把该 API 运行器直接等同于 DSH Web 里的交互 Agent。还需要确认团队实际运行入口、固定 OSWorld 版本、虚拟机提供器/镜像、模型配置和一条实际轨迹。

文档给出的桥接启动方式（仅供部署人员配置，本轮未执行）：

~~~sh
python /path/to/dsh-advanced-mem-plugin/src/evaluation/osworld_bridge.py --host 127.0.0.1 --port 8765 --environment-config /path/to/desktop-env.json --token-env OSWORLD_BRIDGE_TOKEN --max-request-bytes 16777216
~~~

路径和环境配置是占位符；需要预先准备官方 OSWorld Python 环境、DesktopEnv 参数与令牌环境变量。单 bridge 对应一台 VM，文档要求单 bridge 并发为 1。这个 HTTP 服务负责桌面任务操作，不是 Memory Console 的记忆查询接口。

### DSH 是哪个仓库和版本？

[兼容说明](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/docs/compatibility.zh.md)指定宿主为 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)，支持 dsh-v0.2.1-rc.2，固定提交 687f282e8625c6b8d11ff58211a90524be2e4317。插件自身是用户提供的 CenYangtze/dsh-advanced-mem-plugin，不是 DSH 宿主仓库。

这是插件声明的兼容基线，团队当前实际部署版本仍待确认。上游安装说明提供 npm CLI、构建 tgz 和固定 Git 修订三条路径。已核对官方固定版本的 profile 实现，其中 web profile 组合 dsh-base 与 dsh-web-app；没有在本机执行全局安装或修改现有 profile。

### Memory 怎么读取？

已经找到程序接口和命令入口。它们不等同于现成可供独立浏览器跨域调用的 REST API。

| 页面需要的数据 | 已核对的入口 | 接入时仍须处理 |
|---|---|---|
| 事实记录、节点、关系 | ctx.memory.store.records(scopeKeys)、nodes(scopeKeys)、edges(scopeKeys)；getRecord/getNode/getEdge 按 ID 读取 | 服务端确认授权 scope；单 ID 读取不应被当成权限校验；分页、脱敏及只读传输 |
| 事实检索及来源 | ctx.memory.recall(query)，memory/recalled 事件 | 这是查询结果或事件，不能冒充历史注入/采用记录；需确认历史留存方式 |
| 经验、策略和版本 | ctx.experience.memory.snapshot(scope) | 返回 schemaVersion、scope、episodes、skills、revisions、feedback；管理快照不能直接无筛选暴露给浏览器 |
| 经验来源与验证 | /experience sources，experience_inspect 的 skill/sources/verification 视图 | 这些是会话命令和 Agent 工具；网页接入需正式的只读适配层 |
| OSWorld 过程与结果 | runOSWorld 的轨迹 JSON、manifest、results/report | 需一份实际运行且可分享的产物；缺少记录仍显示未知 |

代码依据：[事实服务](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/memory/index.ts)、[存储契约](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/memory/providers.ts)、[经验快照类型](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/experience/types.ts)、[经验引擎](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/experience/core.ts)、[会话命令与工具](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/experience-harness/index.ts)。事实 records/nodes/edges 包含撤回或墓碑记录，页面不能把全部返回项都标成当前有效。

## 前端插件可行性：从未知推进到有源码依据

[package.json](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/package.json)已有 web 客户端入口与 dsh.client 声明；[client/index.ts](https://github.com/CenYangtze/dsh-advanced-mem-plugin/blob/f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a/src/experience-harness/client/index.ts)通过 slots、configForms 与 remote 注册 plugins.bundle.config 配置页，组件采用 React。它说明该兼容版本确有插件 UI 扩展路径。

当前页面用于“记忆模型设置”，保存的是模型选择和凭据引用；它不是 Memory 记录浏览器。此入口不证明任意顶层菜单路由、iframe CSP 或全局换肤已经验证。已检查的客户端入口及 settings 服务中未提供面向 Console 的事实/经验列表传输契约；宿主 remote/configForms 的存在也不等同于这些数据已可远程读取。

建议下一步先做最小只读链路：在隔离的 DSH 开发 profile 里沿已有 bundle 配置页扩展方式验证一个查看入口，通过宿主服务端读取指定 scope 的事实或经验摘要，使用宿主鉴权通道返回页面。确认加载、卸载、空数据、错误、权限与版本兼容后，再决定单独菜单页与样式改造。当前 Console 的全局 DOM、CSS 和 hash 路由仍需隔离或组件化。

在拿到运行环境前，可先完成 Console 字段与上述类型的映射、导入格式与来源标识。不得把上游测试 fixture 当真实运行，也不能把本地 MOCK 接口换个名字就标为在线。

## 现在只需向学长补问这些

下面是讨论稿，尚未发送：

> 学长好，仓库已收到。我看到插件 0.3.0 标注兼容 DSH 0.2.1-rc.2，也有 OSWorld bridge 和 Memory 程序接口。想再确认：我们实际部署是否用这个版本/分支？OSWorld 当前是用仓库的 runOSWorld API，还是已有 DSH Agent 接入脚本，能否提供实际启动配置（去掉密钥）和一条运行产物？Console 准备先做只读展示，方便提供一份脱敏事实记录及经验 snapshot，或告知是否已有只读 remote 接口吗？

不需要提供 API 密钥或含认证 token 的浏览器地址。已能从代码查到的仓库与接口名称不再重复询问。

## 本轮结果与边界

本轮将“没有插件/版本资料”的旧结论更新为“已取得插件源码与兼容基线，尚无本机联调”。没有修改上游仓库，没有架构图工作，没有声称真实记忆、OSWorld 分数或 DSH 挂载已经验证。独立展示继续可用，后续应优先接一条可追溯的只读数据链路。
