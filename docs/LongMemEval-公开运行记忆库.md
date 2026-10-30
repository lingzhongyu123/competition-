# LongMemEval 公开运行记忆库

打开 https://lingzhongyu123.github.io/competition-/index.html#checks ，或直接打开 https://lingzhongyu123.github.io/competition-/longmemeval-public.html 。页面会自动载入用户提供的运行档案展示副本，无需重新选择目录。GitHub Pages 发布需要等待 Actions 成功。

记忆库包含 7 个案例、85 个冻结节点、3430 条恢复文档、63 个问答；按案例或类型筛选、输入关键词搜索、翻页，点记忆标题进入其来源证据与回答。原文为数据集语言。评分是导出档案声明，成功案例精选不代表总体表现。

公开页面不包含完整请求和原始调用日志。每条记录通过允许字段选出；本地输入目录不随代码提交。更新时运行 `node scripts/build-public-runs.mjs <导出目录>`，审阅公开内容后提交生成页。压缩用于减少体积，任何访客都能读取公开副本。目录导入仅在浏览器内存读取，刷新恢复公开副本。

`longmemeval-runs.html` 继续作为无预载数据的本机目录查看器。用户选择的其他目录不会被上传，也不会被自动保存到仓库。
