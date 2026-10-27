# OSWorld 工时任务：本机运行记录

2026-10-27。此页记录真实 OSWorld 环境中的一次探索和失败结果，供 Memory Console 的“任务经验”故事校准证据边界。它不是团队 Agent 的评测报告。

## 固定来源与环境

- 官方 OSWorld 源码固定在 [`044bc339`](https://github.com/xlang-ai/OSWorld/commit/044bc33901cb893808e3f91ebc9a17ed8e54b44c)；任务为 [`357ef137-7eeb-4c80-a3bb-0951f26a8aff`](https://github.com/xlang-ai/OSWorld/blob/044bc33901cb893808e3f91ebc9a17ed8e54b44c/evaluation_examples/examples/libreoffice_calc/357ef137-7eeb-4c80-a3bb-0951f26a8aff.json)，要求在 LibreOffice Calc 计算时间值工时与数值时薪的乘积，且不改动无关空白区域。
- 使用官方 OSWorld Docker/Ubuntu 环境，下载完整性已在本地核对。发布内容省略本机配置、内部路径和文件校验值。
- 本机容器没有 `/dev/kvm`，使用软件虚拟化。桌面画面刷新和点击定位明显滞后。本机镜像、工作簿、运行日志与 DSH profile 均只保留在忽略的本地目录。

## 实际观察

1. OSWorld `DesktopEnv.reset` 下载并打开官方工作簿。可见 D3 工时 `07:40`、F3 时薪 `25`、E3 结果为空。[本机初始画面](images/OSWorld-工时任务-本机初始画面.png)中的最外层标题是桌面弹出的“Hotspot Login”，表格为其下方实际打开的 Calc。未触碰时，`DesktopEnv.evaluate()` 返回 **0.0**。
2. 在隔离 DSH Web 中，将上述屏幕观察转写为文字，交给 DeepSeek-V4.1-Flash。模型给出 `=D3*24*F3`：Calc 时间值按一天的比例存储，需要乘 24 转为小时。这只是基于文字观察得到的建议；模型没有直接看图、调用 OSWorld 动作接口或读取评测参考答案。
3. 我们单独通过 OSWorld `DesktopEnv.step` 尝试执行该公式。第一次点击名称框的坐标落空，编辑进入无关的 A1/A2；第二次点击表格坐标后，画面显示未完成的公式进入 F4，而非 E3。两次 `evaluate()` 均为 **0.0**。客体端 Python 命令返回成功只表示命令被执行，不证明选中了目标单元格或满足任务。
4. 为恢复任务，重新下载了原始工作簿。恢复后的工作簿与原始下载文件在本地校验一致。LibreOffice 异常退出后弹出恢复对话框；第二次 `reset` 的打开文件步骤返回 HTTP 500。尚未确定 500 的直接原因，因此不记录新的基线或成功分数。

## 对展示的意义与下一步

这里得到的是**一条真实失败轨迹**：任务定义、初始画面、模型建议、两次执行尝试及官方评分可以分开呈现。正确的文字公式没有转化为正确的 GUI 操作；失败点是目标单元格选择与桌面响应的可验证性。可把“每步确认选区和最终工作簿，再调用 evaluator”列为经验候选，但尚未形成 Memory Case/Strategy。

当前 DSH Memory 插件在此前的合成偏好任务中有存储与注入记录；本轮 OSWorld 问题没有建立 DSH Agent → OSWorld 的自动执行链，也没有取得这项任务的记忆检索、注入、经验复用或 ON/OFF 对照。控制台中的 OSWorld 成功故事仍为明确标注的 MOCK，不能用这次运行的 0 分替换为“经验提升”数据。
