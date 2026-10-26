# Memory Console 的 DSH 页面试验

目标版本：DSH 0.2.1-rc.2。先在仓库根目录运行 `node scripts/build.mjs`，再在本目录运行 `node build.mjs`，将本目录打包并用 `dsh plugin --profile web add <tgz>` 安装。侧栏会出现「记忆控制台」。

页面把仓库的单文件演示作为 `srcDoc` 放进受限 iframe；iframe 只有脚本和下载权限，没有同源权限，不能读取 DSH 的凭证、Cookie 或存储。来源样本与 MOCK 状态仍由原页面标识，页面本身尚未连接实时 Memory 服务。右上角按钮通过 DSH 官方主题 token 接口预览蓝灰配色，可关闭并恢复原主题；这只是麒麟风格概念验证，并非麒麟官方主题。

打包内容不含 API 密钥、DSH 本机配置、运行快照或日志。更换演示页面后需要重新构建和安装。
