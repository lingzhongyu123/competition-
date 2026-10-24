# 麒麟 Memory Console

基于讨论稿制作的独立交互原型。查看事实与偏好、来源证据、时间更新、检索/注入轨迹，以及规划中的 Case → Strategy → 新任务链路。所有记忆和执行轨迹均为明确标注的 MOCK；OSWorld 卡片仅包含真实公开任务定义。当前未接 DSH、Memory 服务或评测运行器。

## 启动

需要 Node.js 20 或以上，无运行依赖，无需 npm install。

```sh
cd Memory-Console-本地交接/项目
npm run dev
```

默认在本机回环地址的 4173 端口提供静态页面；需要调整端口时使用 `PORT=4174 npm run dev`。服务绑定回环地址，仅用于本地开发。将压缩包解压到你选择的本地目录后，在“项目”文件夹启动。

## 构建与验证

```sh
npm test
npm run build
```

构建产生 `dist/memory-console.html`，为无外部资源的单文件版本，可复制给讨论参与者，在允许本地 HTML 的浏览器中打开。脚本不读取或写入外部服务。构建产物与截图不纳入源码。

可选浏览器回归（需启动本地服务，且测试环境已提供 Playwright 与 Chromium）：

```sh
node tests/ui.cjs
```

`BROWSER_PATH` 可指定 Chromium 可执行文件，默认 `/usr/bin/chromium`。Playwright 只用于可选浏览器检查，未作为应用依赖安装。截图写入 `artifacts/`。

## 已能演示

- 事实/偏好/约束/案例/策略的搜索、类型与状态筛选。
- Day 01、03、07、10、14 历史快照；未来记录与未来替代时间不可见。
- 记忆详情、原始证据和作用域；图谱区分来源与注入关系。
- 同范围的排序规则更新；不影响日期格式与修改范围。
- 检索候选、选中、实际注入字段和执行引用分别显示。
- 合成成功/失败案例、策略适用条件及反例；不宣称真实运行收益。
- 有范围预览与确认的模拟撤回；历史只读，历史 trace 不会被重写。
- 导出 MOCK JSON 证据包、重置演示、主题切换、窄屏布局。
- 5 条真实 OSWorld Calc 任务定义，其中 1 条 evaluator 标记 infeasible；无运行结果。

刷新或重置会恢复演示数据。主题仅在本次页面会话中切换。“麒麟”是概念视觉，不是官方设计规范。

## 项目结构

| 文件 | 作用 |
|---|---|
| `src/data.js` | 合成记忆、证据、trace、生命周期事件 |
| `src/model.js` | 可替换的 mock 数据入口、历史快照与撤回语义 |
| `src/public-tasks.js` | 公开任务卡片，不含 evaluator 答案或初始化配置 |
| `src/app.js` | 页面、导航与交互 |
| `src/styles.css` | 麒麟概念与中性主题、响应式布局 |
| `scripts/serve.mjs` | 仅提供公开页面/资源的本地静态服务 |
| `scripts/build.mjs` | 单文件打包，无外部构建工具 |
| `tests/model.test.mjs` | 时间、更新范围、历史与来源隔离回归 |
| `tests/ui.cjs` | 浏览器完整演示与移动布局检查 |
| `docs/演示与交接.md` | 演示步骤、真实接入所需数据、DSH 集成判断 |

## 当前限制

LongMemEval 官方 README 的类型与字段已核验，原始样本因下载站点代理 403 尚未取得；没有真实 question_id、回放或评分。DSH 仓库/版本未知，不能确认原生页面插件或全局换肤能力。Case、Strategy 与自动冲突检测在后端仍按规划能力处理。

本实现只使用 mock provider，不提供一个遇到真实接口失败就回退合成数据的“在线模式”。真实 API 接入时必须单独处理加载、空结果、权限、错误与能力不可用状态。详见交接说明。

## 协作与直接查看

GitHub 仓库：https://github.com/lingzhongyu123/competition- 。下载源码 ZIP 并解压后，双击根目录的 `双击打开演示.html` 即可查看演示。GitHub 文件页展示源码，不是已部署的网站。

后续改动同时保存在本地并同步此仓库，具体约定见 AGENTS.md。
