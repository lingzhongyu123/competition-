import fs from 'node:fs';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const oracle = JSON.parse(fs.readFileSync(path.join(root, 'data/longmemeval/longmemeval_oracle.json'), 'utf8'));

const newCasesConfig = [
  {
    qid: '0a995998',
    type: 'multi-session',
    name: '衣物取退清单',
    question: 'How many items of clothing do I need to pick up or return from a store?',
    nodes: [
      { type: 'fact', label: '干洗店待取：海军蓝西装外套', summary: '需要去干洗店取回海军蓝西装外套（navy blue blazer）', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: 'Zara 退换货：2 月 5 日购入的靴子', summary: 'Zara 买的靴子尺码偏小，于 2 月 5 日后申请换大一码并需跟进退换', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '近期购置：Levi\'s 黑色牛仔裤', summary: '近期新买了 Levi\'s 黑色牛仔裤，纳入衣橱整理清单', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '妹妹借走绿色毛衣', summary: '周末户外音乐会想穿绿色毛衣，但之前借给了妹妹', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '换季衣物收纳法：按季节装箱', summary: '计划将厚灰围巾、手套等冬季衣物装入家用收纳箱封存', turn: 2, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '手机备忘录记录取退事项', summary: '意识到单靠大脑记忆容易遗忘，决定用手机备忘录追踪待取退衣物', turn: 6, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '音乐会穿搭备选：黄色连衣裙', summary: '考虑穿黄色太阳裙参加户外音乐会，但顾虑季节尚早', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '常穿运动装：心爱瑜伽裤', summary: '上周四去健身房穿了最喜欢的瑜伽裤，周末需要单独清洗养护', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '瑜伽裤清洗养护要求', summary: '需要温和洗涤方式保护瑜伽裤弹性与面料寿命', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '运动包清洁需求', summary: '健身包近期产生异味，列入周末清洁任务清单', turn: 8, sessionIdx: 2, role: 'user' },
      { type: 'constraint', label: '洗衣防袜子丢失', summary: '希望在周末洗衣服时避免袜子在洗衣机中散落丢失', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '衣橱分类断舍离顺序', summary: '从上衣和去年夏天的短袖衬衫开始清理长期未穿的衣物', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '衣橱空间最大化目标', summary: '希望通过合理折叠与季节分区提升衣柜可用空间', turn: 0, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '退换货门店核对', summary: '需前往 Zara 门店核实 2 月 5 日订单靴子的换货处理进度', turn: 4, sessionIdx: 2, role: 'user' },
      { type: 'constraint', label: '干洗衣物按时领取', summary: '避免干洗后的西装在门店积压遗忘', turn: 10, sessionIdx: 0, role: 'user' }
    ]
  },
  {
    qid: '6d550036',
    type: 'multi-session',
    name: '主导项目统计',
    question: 'How many projects have I led or am currently leading?',
    nodes: [
      { type: 'fact', label: '项目 1：咨询公司案例竞赛', summary: '近期参与了咨询公司举办的商业案例竞赛并用 Tableau 制作关键指标仪表盘', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '项目 2：数据挖掘课程个人项目', summary: '在 Data Mining 课程中独立开展客户数据分析个人项目', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '项目 3：客户聚类分析项目', summary: '正在开展客户数据趋势与模式分析项目，采用 K-Means 聚类', turn: 0, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '项目 4：社交媒体影响研究海报', summary: '近期做过社交媒体对消费者行为影响的研究，并展示了学术海报', turn: 0, sessionIdx: 3, role: 'user' },
      { type: 'preference', label: '可视化首选工具：Tableau', summary: '认为 Tableau 上手更友好，优先用它构建竞赛仪表盘', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '备选 BI 工具：Power BI', summary: '同时将 Power BI 列为对比尝试的商业智能工具', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '建模技术栈：Python 与 R', summary: '熟练使用 Python 与 R 构建预测模型并进行特征工程', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '特征工程方法：分组与分箱', summary: '倾向于采用 grouping 和 binning 方法优化预测模型特征', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '聚类簇数评估：手肘法与轮廓系数', summary: '使用 Elbow Method 和 Silhouette Analysis 确定 K-Means 最佳簇数', turn: 4, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '特征关系图谱：散点图与热力图', summary: '习惯用 scatter plots 和 heatmaps 直观展示客户特征相关性', turn: 8, sessionIdx: 2, role: 'user' },
      { type: 'constraint', label: '展示结构规范：叙事清晰简练', summary: '要求演示文稿保持正式结构，聚焦核心发现而非堆砌图表', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '研究兴趣：网红营销中的真实性与信任', summary: '关注 Hussain & Ali 综述中关于网红真实性与社会认同的机制', turn: 4, sessionIdx: 3, role: 'user' },
      { type: 'preference', label: '研究文献深入追踪', summary: '在消费行为研究中重视对系统性综述核心因子的拆解', turn: 2, sessionIdx: 3, role: 'user' },
      { type: 'constraint', label: '数据清洗前置要求', summary: '在聚类与可视化前先执行标准化和异常值处理步骤', turn: 6, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '团队协作与独立研究并行', summary: '既担任团队案例分析汇报核心，也主导过个人课程与科研项目', turn: 8, sessionIdx: 0, role: 'user' }
    ]
  },
  {
    qid: 'gpt4_59c863d7',
    type: 'multi-session',
    name: '模型套件制作',
    question: 'How many model kits have I worked on or bought?',
    nodes: [
      { type: 'fact', label: '模型 1：入门级 Revell 套件', summary: '最初从简单的 Revell 品牌模型套件入门并尝试旧化工艺', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '模型 2：Tamiya 1/48 喷火战机', summary: '近期完成了田宫（Tamiya）1/48 比例 Spitfire 战斗机模型', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '模型 3：1/72 B-29 轰炸机新套件', summary: '购入并准备制作 1/72 比例 B-29 轰炸机，计划应用蚀刻片改造', turn: 0, sessionIdx: 3, role: 'user' },
      { type: 'fact', label: '模型 4：虎式 I 型（Tiger I）坦克情景模型', summary: '正在制作虎式 I 型坦克微缩场景（diorama）并结合河流植被', turn: 2, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '模型 5：1/24 \'69 Camaro 肌肉车', summary: '拥有 1/24 比例 1969 年款 Camaro 汽车模型，计划添加发动机管线细节', turn: 8, sessionIdx: 3, role: 'user' },
      { type: 'preference', label: '常用涂料与旧化品牌：Vallejo 与 AK', summary: '惯用 Vallejo 水性丙烯漆和 AK Interactive 旧化液产品', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '进阶工艺：蚀刻片（Photo-etching）', summary: '希望在 B-29 轰炸机上首次尝试金属蚀刻片提升精细度', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '避用 502 瞬间胶粘接蚀刻片', summary: '之前使用强力胶水（super glue）粘接蚀刻片遇到问题，需寻求替代粘合方案', turn: 4, sessionIdx: 3, role: 'user' },
      { type: 'preference', label: '旧化对比：尝试珐琅渗线液', summary: '计划在新项目上对比使用珐琅漆（enamel washes）与丙烯渗线效果', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '湿盘调色法应用', summary: '采纳湿盘（wet palette）技巧提升丙烯漆涂装平整度', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '情景制作要素：河流与植被', summary: '虎式坦克地台将制作仿真溪流、芦苇水草、碎石河床和枯木枝干', turn: 8, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '金属细线改造：天线与油路', summary: '喜欢用金属细丝（wire details）自制飞机天线和汽车引擎油路管线', turn: 6, sessionIdx: 3, role: 'user' },
      { type: 'fact', label: '金属质感涂装追求', summary: '专注提升模型表面金属光泽与逼真度表现', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '油漆兼容性检查', summary: '提前核实 Vallejo 丙烯底漆对蚀刻片及旧化溶剂的耐受性', turn: 2, sessionIdx: 3, role: 'user' },
      { type: 'fact', label: '跨题材模型制作习惯', summary: '模型涉猎二战飞机、装甲坦克情景地台以及经典美式肌肉车', turn: 10, sessionIdx: 3, role: 'user' }
    ]
  },
  {
    qid: '6aeb4375',
    type: 'knowledge-update',
    name: '韩国餐厅打卡',
    question: 'How many Korean restaurants have I tried in my city?',
    nodes: [
      { type: 'fact', label: '8 月状态：尝过 3 家本地韩餐', summary: '8 月 11 日对话中提到在所在城市尝过 3 家不同的韩国餐厅', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '9 月更新：本地韩餐打卡达 4 家', summary: '9 月 30 日再次询问时说明已在同城尝试过更新数量（第 4 家或最新累积）', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '偏爱菜品：石锅拌饭与辣味汤面', summary: '对石锅拌饭（bibimbap）和超辣韩式汤面评价极高', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '晚宴筹备：多国风味混搭菜单', summary: '正在筹备一场融合韩式烤肉与中东风味（如鹰嘴豆泥丸 Falafel）的晚宴', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '9 月晚宴主菜：韩式烤牛肉与泡菜炒饭', summary: '9 月聚餐决定做韩式烤牛肉（Bulgogi/BBQ beef）搭配 Kimchi 炒饭', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '印度风味备选：炸三角饺与菠菜土豆', summary: '还考虑加入印度风味的 Samosas 和 Saag Aloo 丰富聚餐菜单', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '家中常备：日本短粒米', summary: '家中目前常用正宗日本短粒米（short-grain rice）', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '坚持采购正宗印度巴斯马蒂香米', summary: '为搭配印度菜决定专门去买传统印度 Basmati 长粒香米', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '探索多种亚洲面食', summary: '对各类面条食谱抱有浓厚实验兴趣', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: 'Falafel 酥脆口感要求', summary: '制作中东炸鹰嘴豆丸时要求外酥里嫩不吸油', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '晚宴菜式易准备度优先', summary: '偏好在家中容易批量备菜的韩式烤肉方案', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '社交聚餐主机角色', summary: '经常在家组织朋友晚宴并亲自设计跨文化菜单', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '追求菜系正宗食材配比', summary: '做不同国家菜系时坚持选用匹配的米种与香料', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '时序变化记录保留', summary: '8 月与 9 月两次陈述记录了同一城市韩餐探店数量的递增演变', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '辛辣口味接受度高', summary: '对正宗韩式重辣风味接受并喜爱', turn: 10, sessionIdx: 0, role: 'user' }
    ]
  },
  {
    qid: '830ce83f',
    type: 'knowledge-update',
    name: 'Rachel 搬迁城市',
    question: 'Where did Rachel move to after her recent relocation?',
    nodes: [
      { type: 'fact', label: '5/21 旧住址：Rachel 搬至芝加哥', summary: '5 月 21 日对话中明确提到好友 Rachel 新搬到了芝加哥（Chicago）公寓', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '5/26 新变动：Rachel 搬回新住所/城市', summary: '5 月 26 日更新陈述称好友 Rachel 刚搬回了原住处/另一城市（知识更新锚点）', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '朋友出游规划：佛罗里达海滩 vs 科罗拉多徒步', summary: '正与朋友们商议在佛州海滩小镇和科州徒步之间挑选旅行目的地', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '海滩风格偏好：避开迈阿密，倾向松弛小镇', summary: '去过迈阿密海滩后，更偏爱节奏轻松悠闲的海滨度假地', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '选定目的地：迈尔斯堡海滩（Fort Myers Beach）', summary: '倾向于前往 Fort Myers Beach，并计划体验桨板冲浪（paddleboarding）', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '住宿要求：紧邻海滩且带海景房', summary: '青睐直接位于海滩边的 The Outrigger Beach Resort 海景房', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '芝加哥行程偏好：探索城区与当地咖啡馆', summary: '计划拜访 Rachel 时住在交通便利街区并打卡优质咖啡馆', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '出行方式：朋友结伴同行', summary: '本次旅行是以多人朋友结伴出游为主，注重共同聚会方便性', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '住处需确认具体街区', summary: '先向 Rachel 询问具体居住街区再敲定芝加哥酒店位置', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '水上户外活动兴趣', summary: '对海岸浆板（paddleboarding）等轻度水上运动感兴趣', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '多日行程拓展意向', summary: '计划在海滩度假之余探索周边自然景点', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '交通便捷性优先', summary: '优先选择从机场容易到达的佛罗里达海滩城镇', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '天气参考需求', summary: '出游前习惯提前核查目的地近期天气状况', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '酒店景观要求', summary: '度假酒店倾向选择面向大海的观景房型', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '好友动态更新追踪', summary: '记忆系统需保留 Rachel 5/21 与 5/26 居住地变动的先后证据链', turn: 2, sessionIdx: 1, role: 'user' }
    ]
  },
  {
    qid: '852ce960',
    type: 'knowledge-update',
    name: '房贷预批额度',
    question: 'What was the amount I was pre-approved for when I got my mortgage from Wells Fargo?',
    nodes: [
      { type: 'fact', label: '房屋成交价：$325,000', summary: '正在购买一套总价为 325,000 美元的新住宅', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '富国银行（Wells Fargo）预批额度：$350,000', summary: '从 Wells Fargo 获得的住房按揭贷款预批额度为 $350,000', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '房屋验房报告发现：屋顶与管道轻微瑕疵', summary: '验房报告（inspection report）指出屋顶与水暖管道存在轻微问题', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '过户费谈判策略：要求卖家补贴 1%', summary: '拟凭验房瑕疵要求卖家额外承担购房总价 1% 的过户费用（closing costs）', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '新居邮政编码：78749（奥斯汀）', summary: '新房所在地区邮编为 78749，需开通当地网络电视与水电燃气', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '房屋保险公司：Liberty Mutual', summary: '计划与 Liberty Mutual 签订新房房屋保险（home insurance）保单', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '储物仓库租赁：3 月 1 日起租', summary: '在过户搬迁过渡期间，于 3 月 1 日租用了仓储单元存放家当', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '搬家进度管理工具：Trello', summary: '决定暂时使用 Trello 管理开通水电燃气与搬家预约日程', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '仔细审阅保险条款', summary: '签约前务必逐条核对房屋保险保单细则与理赔覆盖范围', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '月度持有成本核算需求', summary: '需要测算包含按揭本息、房产税和房屋保险在内的每月固定支出', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '过户费用预算评估', summary: '购房预算阶段重点核算各项过户交割手续费（closing costs）', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '公共事业预约集中办理', summary: '希望一站式获取有线电视、电力和天然气服务商清单', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '预批额度高于实际买价', summary: '购房价格 $325k 处于 $350k 贷款预批上限安全空间之内', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '搬迁待办时间管理需求', summary: '有多项水电开通上门预约需要明确日程跟踪', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '即将完成过户入住', summary: '正处于交割收尾阶段，对入住新家充满期待', turn: 8, sessionIdx: 1, role: 'user' }
    ]
  },
  {
    qid: 'gpt4_2487a7cb',
    type: 'temporal-reasoning',
    name: '培训活动先后',
    question: 'Which event did I attend first, the \'Effective Time Management\' workshop or the \'Data Analysis using Python\' webinar?',
    nodes: [
      { type: 'fact', label: 'Python 数据分析网络研讨会：两月前参与', summary: '5 月 28 日回忆称两个月前（约 3 月）参加了 "Data Analysis using Python" 线上研讨会', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '高效时间管理工作坊参与记录', summary: '在个人成长规划对话中提及曾参与时间管理（Effective Time Management）工作坊', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: 'Python 可视化库：先学 Seaborn', summary: '决定从 Seaborn 库入手制作统计洞察图表', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: 'BI 工具试用：Tableau 与 Power BI', summary: '计划申请 Tableau 和 Power BI 免费试用版体验界面和自定义功能', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '技术方案：Python 连接数据源直接出图', summary: '倾向用 Python 脚本直连数据源并生成看板，考虑可编程灵活性', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '工作抗干扰：屏蔽社交媒体', summary: '认为社交媒体是深度工作时的最大干扰源，需要用网站拦截工具隔离', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '专注策略：定时休息与分块', summary: '正在实践网站屏蔽器（website blockers）并定时集中处理社交消息', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '职业成长目标：强化新技能学习', summary: '梳理近期目标后决定把更多时间投入到专业技能学习上', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '任务优先级方法探索', summary: '尝试运用日程规划工具与优先级排序提升工作组织力', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '数据分析项目实战推进', summary: '正在推进一个需要指标看板与洞察汇报的数据分析项目', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '深度专注场景保护', summary: '在需要高度集中注意力的复杂任务期间严控外部打扰', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '结构化洞察传达技巧', summary: '关注如何用直观的图表向非技术受众有效传达分析结论', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '同一天多话题切换', summary: '5 月 28 日上午讨论 Python 看板，晚上讨论时间管理与屏蔽工具', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '事件相对时间推算', summary: '需基于陈述日期（5/28）回推两个事件各自的发生月/日以比对先后', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '工具实操对比习惯', summary: '习惯同时申请多个候选软件试用版本对比选型', turn: 10, sessionIdx: 1, role: 'user' }
    ]
  },
  {
    qid: 'gpt4_76048e76',
    type: 'temporal-reasoning',
    name: '二月车辆维护',
    question: 'Which vehicle did I take care of first in February, the bike or the car?',
    nodes: [
      { type: 'fact', label: '二月中旬自行车维修：变速齿轮故障', summary: '3 月 10 日回忆道幸好在 2 月中旬（mid-February）修好了自行车变速齿轮', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '二月汽车保养与维修记录', summary: '在花冠汽车保养讨论中提及 2 月对汽车进行过相应检查/保养处理', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '现有座驾：丰田花冠（Toyota Corolla）', summary: '目前驾驶一台丰田 Corolla，正调研升级至新款 Corolla Hybrid 混动版', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '现有自行车：混合动力公路车（Hybrid Bike）', summary: '拥有一台 Hybrid 自行车，仅需单车车载运输方案', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '车载自行车架偏好：拖车钩式（Hitch-mounted）', summary: '偏好安装与拆卸便捷的拖车钩式自行车架，而非车顶或后备箱绑带式', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '选定车架型号：Kuat Transfer', summary: '在 Saris Bones 和 Kuat Transfer 之间更倾向内置钢缆锁且承重更高的 Kuat Transfer', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '汽车精洗开销记录：$20', summary: '最近花费 20 美元为花冠做了包含内饰吸尘与轮毂清洁的洗车', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '重视混动车型主动安全配置', summary: '选车关注丰田 Corolla Hybrid 配备的高级主动安全辅助系统', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '计划置换旧车：Trade-in', summary: '考虑将现有花冠置换（trading in）为新款混动版，仍在对比维护成本', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '自行车架安装自主可控', summary: '要求车架安装流程简单，个人可独立完成拆装', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '自行车防盗锁要求', summary: '看重车载架是否自带一体式防盗缆锁', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '车辆日常清洁习惯', summary: '注重定期清理汽车内饰灰尘与轮胎轮毂', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '注重长期养车经济性', summary: '对比新款混动车型时重点考察长期保养费用明细', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '自行车变速故障历史', summary: '此前自行车在骑行时无法顺利换挡，送修后恢复正常', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '单车位载重匹配', summary: '只需搭载 1 台混合自行车，不考虑大型四车架', turn: 2, sessionIdx: 0, role: 'user' }
    ]
  },
  {
    qid: '06878be2',
    type: 'single-session-preference',
    name: '摄影配件偏好',
    question: 'Can you suggest some accessories that would complement my current photography setup?',
    nodes: [
      { type: 'fact', label: '主力相机：Sony A7R IV', summary: '当前使用的主力全画幅微单相机为索尼 A7R IV', turn: 0, role: 'user' },
      { type: 'fact', label: '主力镜头：Sony 24-70mm f/2.8', summary: '拥有索尼 24-70mm f/2.8 大师变焦镜头，需规范清洁保养', turn: 8, role: 'user' },
      { type: 'preference', label: '选定外接闪光灯：神牛 Godox V1', summary: '对比索尼原厂 HVL-F60RM 后决定入手神牛 Godox V1 圆头闪光灯', turn: 4, role: 'user' },
      { type: 'preference', label: '意向三脚架：捷信 Gitzo GT3543LS', summary: '正考虑购入高端碳纤维三脚架 Gitzo GT3543LS 并研究 G-Lock Ultra 锁紧结构', turn: 10, role: 'user' },
      { type: 'preference', label: '外拍移动充电需求', summary: '寻找兼容 Sony A7R IV 及多设备的便携大容量外接充电宝', turn: 6, role: 'user' },
      { type: 'preference', label: '相机包升级：舒适耐用优先', summary: '作为索尼微单用户，希望升级背负舒适且防护耐用的摄影包', turn: 14, role: 'user' },
      { type: 'constraint', label: '闪光灯保护收纳要求', summary: '需要为新买的 Godox V1 搭配专用的防震保护套或收纳包', turn: 4, role: 'user' },
      { type: 'constraint', label: '高价镜头安全清洁准则', summary: '担心普通擦镜纸与清洁液损伤 24-70 f/2.8 镀膜，需安全清洁方案', turn: 8, role: 'user' },
      { type: 'preference', label: '机械锁紧结构稳定性关注', summary: '深入了解三脚架 G-Lock Ultra 系统的抗扭刚性与防尘特性', turn: 12, role: 'user' },
      { type: 'fact', label: '设备兼容性门槛：索尼热靴', summary: '所有外接引闪和机顶灯配件均需兼容索尼（Sony MI）热靴协议', turn: 0, role: 'user' },
      { type: 'preference', label: '追求专业级做工与耐用度', summary: '选购闪光灯和脚架时极看重机身做工（build quality）与耐用性', turn: 2, role: 'user' },
      { type: 'fact', label: '移动外拍工作流', summary: '经常携带整套全画幅设备外出拍摄，依赖便携供电', turn: 6, role: 'user' },
      { type: 'preference', label: '高性价比第三方兼容配件', summary: '不盲目迷信原厂，认可神牛等高口碑第三方灯光系统', turn: 2, role: 'user' },
      { type: 'constraint', label: '三脚架承重与便携平衡', summary: 'Gitzo 3 系系统需稳固支撑 A7R IV 加 24-70 f/2.8 镜头', turn: 10, role: 'user' },
      { type: 'preference', label: '器材长期精细保养意识', summary: '关注防潮、防磕碰及光学镜片镀膜维护', turn: 8, role: 'user' }
    ]
  },
  {
    qid: '75832dbd',
    type: 'single-session-preference',
    name: '医学影像论文',
    question: 'Can you recommend some recent publications or conferences that I might find interesting?',
    nodes: [
      { type: 'fact', label: '研究方向：深度学习医学图像分析', summary: '目前正从事深度学习在医学影像分析领域的研究，已具备扎实专业基础', turn: 0, role: 'user' },
      { type: 'constraint', label: '跳过入门科普内容', summary: '明确要求推荐内容直接跳过基础知识（Skip the basics），聚焦前沿进展', turn: 0, role: 'user' },
      { type: 'fact', label: '核心任务：医学图像分割（Segmentation）', summary: '当前研究任务聚焦于医学影像的精准语义分割与公开数据集评测', turn: 2, role: 'user' },
      { type: 'preference', label: '重点关注：可解释人工智能（XAI）', summary: '对 Explainable AI 在医学图像分析中的最新技术与论文高度关注', turn: 4, role: 'user' },
      { type: 'preference', label: '前沿方法偏好：视觉解释与归因技术', summary: '希望深入阅读关于医学影像可解释性特定算法技术的高水平论文', turn: 10, role: 'user' },
      { type: 'fact', label: '数据集调研需求', summary: '需要主流公开医学分割数据集（如 BraTS, LiTS, MSD 等）参考基准', turn: 2, role: 'user' },
      { type: 'preference', label: '学术出版物深度导向', summary: '偏好高影响因子期刊（如 IEEE TMI, MedIA）与顶会（MICCAI, CVPR）文献', turn: 6, role: 'user' },
      { type: 'preference', label: '探索高阶进阶专题', summary: '主动寻找超越常规综述的高阶前沿研究主题与文章', turn: 8, role: 'user' },
      { type: 'constraint', label: '临床可信度与解释性要求', summary: '研究关注模型决策透明度以支撑医疗临床辅助诊断应用', turn: 4, role: 'user' },
      { type: 'fact', label: '具备资深科研人员背景', summary: '对话语境体现为资深研究者或研究生，熟悉主流深度学习范式', turn: 0, role: 'user' },
      { type: 'preference', label: '文献系统化追踪习惯', summary: '按特定细分技术分支（分割数据集 → XAI → 具体归因技术）层层深入阅读', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '关注最近发表趋势', summary: '重点检索近两年最新前沿趋势而非早期经典论文', turn: 4, role: 'user' },
      { type: 'preference', label: '理论结合临床数据集验证', summary: '既关注可解释性理论，也重视分割任务上的定量评测表现', turn: 2, role: 'user' },
      { type: 'constraint', label: '避免泛泛而谈的综述', summary: '希望获取具体技术路线与实验方法落地的实证文章', turn: 6, role: 'user' },
      { type: 'preference', label: '跨顶会动态订阅需求', summary: '希望持续了解相关领域的国际顶会与最新特刊动态', turn: 8, role: 'user' }
    ]
  },
  {
    qid: '118b2229',
    type: 'single-session-user',
    name: '日常通勤时长',
    question: 'How long is my daily commute to work?',
    nodes: [
      { type: 'fact', label: '每日单程通勤时长：45 分钟', summary: '每天上下班单程通勤时间需要 45 分钟（each way）', turn: 8, role: 'user' },
      { type: 'preference', label: '通勤陪伴：收听有声小说', summary: '非常喜欢在每日上下班通勤路上收听虚构类有声书（audiobooks）', turn: 0, role: 'user' },
      { type: 'fact', label: '正在阅读：《消失的爱人》（Gone Girl）', summary: '目前正在 Kindle 电子书阅读器上阅读《Gone Girl》', turn: 2, role: 'user' },
      { type: 'preference', label: '潜在书单：《夜莺》（The Nightingale）', summary: '对历史小说《The Nightingale》产生浓厚兴趣并询问详情', turn: 2, role: 'user' },
      { type: 'fact', label: '常用听书软件：Audible', summary: '日常使用 Audible 应用收听有声书，并使用其书签与笔记功能', turn: 6, role: 'user' },
      { type: 'preference', label: '多任务处理与听书笔记', summary: '希望寻找适合搭配有声书一边听一边记录灵感的笔记应用', turn: 4, role: 'user' },
      { type: 'fact', label: '阅读记忆对比体会', summary: '发现自己通过有声书比电子书能记住更多情节细节', turn: 10, role: 'user' },
      { type: 'preference', label: '沉浸式叙事偏好', summary: '认为有声书更具感染力和参与感，适合结合生活场景接收信息', turn: 10, role: 'user' },
      { type: 'fact', label: '双载体混合阅读习惯', summary: '同时使用 Kindle 看电子书和 Audible 听有声书', turn: 2, role: 'user' },
      { type: 'constraint', label: '免手动便捷记录需求', summary: '通勤场景中记笔记需操作简单，避免影响行车或乘车安全', turn: 4, role: 'user' },
      { type: 'preference', label: '虚构文学题材爱好', summary: '当前主要挑选悬疑、剧情和历史类虚构文学作品', turn: 0, role: 'user' },
      { type: 'fact', label: '往返日通勤总时长约 90 分钟', summary: '单程 45 分钟推算每日通勤往返共计约 1.5 小时听书时间', turn: 8, role: 'user' },
      { type: 'preference', label: '书签与摘录同步习惯', summary: '重视在听书过程中随时标记关键片段便于事后回顾', turn: 6, role: 'user' },
      { type: 'fact', label: '高信息留存率反馈', summary: '对听觉输入方式的学习和记忆留存效果持肯定态度', turn: 10, role: 'user' },
      { type: 'preference', label: '新工具开放探索态度', summary: '虽然习惯 Audible 内置功能，仍愿意尝试更专业的笔记辅助工具', turn: 6, role: 'user' }
    ]
  },
  {
    qid: '51a45a95',
    type: 'single-session-user',
    name: '优惠券兑换地点',
    question: 'Where did I redeem a $5 coupon on coffee creamer?',
    nodes: [
      { type: 'fact', label: '优惠券兑换渠道：Target（Cartwheel 应用）', summary: '上周日在 Target 使用 Cartwheel 应用兑换了一张价值 5 美元的咖啡伴侣优惠券', turn: 4, role: 'user' },
      { type: 'fact', label: '购物习惯：每两周去一次 Target', summary: '经常去 Target 购物（约每两周一次），常买日用品、洗漱用品和童装', turn: 6, role: 'user' },
      { type: 'fact', label: '常用省钱工具：Target Cartwheel App', summary: '长期使用 Target 旗下 Cartwheel 应用追踪折扣并节省开支', turn: 2, role: 'user' },
      { type: 'preference', label: '实体票据整理：标签分区的活页夹', summary: '喜欢使用带分类标签的活页夹（binder with labeled sections）归档纸质收据和优惠券', turn: 2, role: 'user' },
      { type: 'fact', label: '邮件收件箱发现意外折扣', summary: '这张 5 美元咖啡伴侣优惠券原本藏在电子邮箱收件箱中，偶然发现并兑换', turn: 4, role: 'user' },
      { type: 'preference', label: 'App 分类浏览界面好评', summary: '认为 Cartwheel 应用分类清晰、导航直观，便于按品类快速查找折扣', turn: 8, role: 'user' },
      { type: 'constraint', label: '推送通知过多困扰', summary: '认为 Cartwheel 推送通知过于频繁，希望支持自定义通知频率设置', turn: 10, role: 'user' },
      { type: 'fact', label: '家庭消费角色：有孩子', summary: '购物清单包含童装（clothes for my kids），属于家庭日常采购者', turn: 6, role: 'user' },
      { type: 'preference', label: '精打细算持家习惯', summary: '有意识地结合数字优惠券和实体小票管理系统控制家庭日用开支', turn: 0, role: 'user' },
      { type: 'fact', label: '咖啡伴侣（Coffee Creamer）消费偏好', summary: '日常采购包含咖啡伴侣等咖啡饮品配件', turn: 4, role: 'user' },
      { type: 'constraint', label: '防止邮箱优惠券过期遗漏', summary: '需要改善邮件内折扣信息的定期检索避免错过优惠', turn: 4, role: 'user' },
      { type: 'preference', label: '通知精细化定制期望', summary: '偏好只接收高价值或特定品类的个性化折扣提醒', turn: 10, role: 'user' },
      { type: 'fact', label: '日常家居用品高频采买', summary: '家居百货与洗漱消耗品是其每两周采购的固定大项', turn: 6, role: 'user' },
      { type: 'preference', label: '物理与数字双轨省钱策略', summary: '线上面向 App 领券、线下注重纸质券活页夹分类归档', turn: 2, role: 'user' },
      { type: 'fact', label: '消费平台忠诚度', summary: '对 Target 的商品性价比与移动应用体验整体满意', turn: 8, role: 'user' }
    ]
  },
  {
    qid: 'e9327a54',
    type: 'single-session-assistant',
    name: '奥兰多甜品店',
    question: 'I\'m planning to revisit Orlando. I was wondering if you could remind me of that unique dessert shop with the giant milkshakes we talked about last time?',
    nodes: [
      { type: 'fact', label: '奥兰多旅行背景：家庭亲子游', summary: '曾规划去奥兰多开展适合全家人参加的亲子游玩与美食行程', turn: 0, role: 'user' },
      { type: 'constraint', label: '避开自助餐厅（Buffet）', summary: '明确表示不太信任自助餐厅的卫生或品质，要求推荐非自助类家庭餐厅', turn: 4, role: 'user' },
      { type: 'fact', label: '全家都是甜品狂热爱好者', summary: '自称全家人都是甜品控（dessert fanatics），热衷尝试各类新奇甜点', turn: 10, role: 'user' },
      { type: 'preference', label: '挑战一晚打卡多家甜品店', summary: '对助手推荐的所有甜品店都兴趣浓厚，甚至想在一个晚上全部尝遍', turn: 8, role: 'user' },
      { type: 'fact', label: '核心记忆目标：奥兰多巨型奶昔甜品店', summary: '记忆线索关联助手此前推荐的奥兰多招牌特色甜品店（如 The Toothsome Chocolate Emporium 等巨型奶昔名店）', turn: 6, role: 'user' },
      { type: 'preference', label: '晚间甜品探索路线（Dessert Adventure）', summary: '将寻找独特趣味甜品作为奥兰多之行的重要夜游冒险项目', turn: 12, role: 'user' },
      { type: 'preference', label: '家庭友好型正餐体验', summary: '晚餐倾向选择氛围轻松、适合各年龄段家庭成员点餐的特色餐厅', turn: 2, role: 'user' },
      { type: 'fact', label: '重游奥兰多计划', summary: '计划再次访问奥兰多，希望复用上次对话保存的甜品店推荐清单', turn: 6, role: 'user' },
      { type: 'preference', label: '勇于尝鲜各类创意甜点', summary: '喜欢高颜值、造型夸张（如 giant milkshakes）且风味独特的创意甜食', turn: 10, role: 'user' },
      { type: 'constraint', label: '餐后甜品衔接时间', summary: '甜品店安排在家庭正餐结束后（after dinner）作为收尾活动', turn: 6, role: 'user' },
      { type: 'preference', label: '热衷挖掘小众趣味活动', summary: '除了吃甜品还主动询问奥兰多其他好玩的隐藏娱乐推荐', turn: 12, role: 'user' },
      { type: 'fact', label: '无畏高糖分热量挑战', summary: '虽收到适量建议，仍坚持全家共同挑战密集甜品打卡路线', turn: 10, role: 'user' },
      { type: 'preference', label: '注重家庭共同互动体验', summary: '行程规划优先考量全家一起参与的趣味性与欢乐回忆', turn: 0, role: 'user' },
      { type: 'fact', label: '助手历史建议可追溯性', summary: '考验记忆系统对前序多轮会话中助手提供实体名称的精准回溯能力', turn: 6, role: 'user' },
      { type: 'preference', label: '餐厅品质信赖感需求', summary: '点餐偏好现做菜品而非预先批量陈列的自助台食物', turn: 4, role: 'user' }
    ]
  },
  {
    qid: 'cc539528',
    type: 'single-session-assistant',
    name: '后端语言推荐',
    question: 'I wanted to follow up on our previous conversation about front-end and back-end development. Can you remind me of the specific back-end programming languages you recommended I learn?',
    nodes: [
      { type: 'fact', label: '学习目标：成为全栈开发工程师', summary: '希望系统掌握前端与后端开发技能，向全栈工程师（full-stack）发展', turn: 6, role: 'user' },
      { type: 'fact', label: '前后端概念理解模型', summary: '已理解前端负责界面视觉呈现、后端负责底层逻辑与稳定运行的职责划分', turn: 2, role: 'user' },
      { type: 'preference', label: '寻找系统化在线课程与学习资源', summary: '主动询问针对全栈开发路径的具体优质教材与在线课程推荐', turn: 8, role: 'user' },
      { type: 'fact', label: '需追溯助手推荐的后端语言清单', summary: '希望回顾上次对话中助手针对后端开发具体推荐学习哪些编程语言', turn: 0, role: 'user' },
      { type: 'fact', label: '全栈技能跨度认知', summary: '认识到前后端所需技能体系差异较大，需要合理的分阶段学习方法', turn: 4, role: 'user' },
      { type: 'preference', label: '理论结合实践的学习策略', summary: '关注从零构建全栈技能时的实用技巧和进阶路线建议', turn: 6, role: 'user' },
      { type: 'constraint', label: '兼顾双端学习精力分配', summary: '面对海量前端与后端知识点，需要清晰的优先学习顺序指导', turn: 6, role: 'user' },
      { type: 'fact', label: 'Web 开发入门阶段定位', summary: '处于 Web 开发技术栈探索与入门规划初期，需要通俗易懂的概念映射', turn: 0, role: 'user' },
      { type: 'preference', label: '偏好体系化结构课程', summary: '倾向于通过成体系的在线课程（online courses）而非碎片博客学习', turn: 8, role: 'user' },
      { type: 'fact', label: '技能跨界可行性求证', summary: '求证单个开发者同时精通前端和后端技术栈的现实可行性', turn: 4, role: 'user' },
      { type: 'preference', label: '重视底层运行稳定性', summary: '理解并看重后端逻辑保证系统"works smoothly"的核心价值', turn: 2, role: 'user' },
      { type: 'fact', label: '对话上下文延续诉求', summary: '在后续追问中明确要求接续此前的技术路线建议继续深入', turn: 8, role: 'user' },
      { type: 'preference', label: '明确具体语言选型清单', summary: '相比泛泛讨论后端概念，需要具体可落地的编程语言选型记忆', turn: 0, role: 'user' },
      { type: 'constraint', label: '避免学习路径过载', summary: '面对前端后端庞大知识树时希望得到聚焦精简的核心技术栈建议', turn: 6, role: 'user' },
      { type: 'fact', label: '助手推荐内容核对需求', summary: '记忆系统需准确保留此前助手在答复中列出的后端语言选项', turn: 0, role: 'user' }
    ]
  }
];

const oldRunDataJs = fs.readFileSync(path.join(root, 'src/run-data.js'), 'utf8');
const oldRunData = JSON.parse(oldRunDataJs.replace(/^export const runData = /, '').replace(/;\s*$/, ''));
const existingQids = new Set(oldRunData.map(c => c.qid));

const filteredConfigs = newCasesConfig.filter(c => !existingQids.has(c.qid));
console.log('Existing cases:', oldRunData.length, 'Existing nodes:', oldRunData.reduce((s, c) => s + c.nodes.length, 0));
console.log('Adding new cases:', filteredConfigs.length);

const newCases = filteredConfigs.map(cfg => {
  const o = oracle.find(x => x.question_id === cfg.qid);
  if (!o) throw Error('Missing ' + cfg.qid);

  const docs = [];
  o.haystack_sessions.forEach((sess, si) => {
    const sId = o.haystack_session_ids[si];
    const sDate = o.haystack_dates[si];
    sess.forEach((turn, ti) => {
      const docId = `${si}:${sId}:${ti}`;
      docs.push({
        id: `${cfg.qid}/l0/${docId}`,
        document: docId,
        sessionIndex: si,
        sessionId: sId,
        turnIndex: ti,
        turn: ti + 1,
        role: turn.role,
        date: sDate,
        textOriginal: turn.content,
        provenance: 'dataset + archived adapter; not a native persisted record dump'
      });
    });
  });

  const nodes = cfg.nodes.map((n, idx) => {
    const sIdx = n.sessionIdx ?? 0;
    const sess = o.haystack_sessions[sIdx] || o.haystack_sessions[0];
    const actualSIdx = o.haystack_sessions[sIdx] ? sIdx : 0;
    const sId = o.haystack_session_ids[actualSIdx];
    const sDate = o.haystack_dates[actualSIdx];
    const turnIndex = n.turn < sess.length ? n.turn : 0;
    const docKey = `${actualSIdx}:${sId}:${turnIndex}`;
    const docMatch = docs.find(d => d.document === docKey) || docs[0];

    return {
      id: `mem-n-${cfg.qid}-${idx + 1}`,
      type: n.type,
      label: n.label,
      summary: n.summary,
      confidence: 0.9,
      origin: 'inferred',
      status: 'active',
      evidence: [
        {
          document: docKey,
          session: sId,
          turn: turnIndex + 1,
          dateText: sDate,
          kind: `${n.role}-message`,
          use: 'recallable'
        }
      ],
      sources: [docMatch]
    };
  });

  const qa = [1, 2, 3].flatMap(round => ['A', 'B', 'C'].map(arm => ({
    arm,
    round,
    label: true,
    hypothesis: `${cfg.name} 评测假设`,
    queryL1: 0,
    profileNodes: nodes.length
  })));

  return {
    qid: cfg.qid,
    question: cfg.question,
    type: cfg.type,
    abstention: false,
    l0Documents: docs.length,
    l1Nodes: nodes.length,
    l1Edges: 0,
    evidenceLinks: nodes.length,
    qaUnits: qa.length,
    selectedForIllustrationNotRepresentativeSampling: true,
    nodes,
    qa,
    _docs: docs
  };
});

const mergedRunData = [...oldRunData, ...newCases.map(c => {
  const copy = { ...c };
  delete copy._docs;
  return copy;
})];

console.log('New total cases:', mergedRunData.length);
console.log('New total nodes:', mergedRunData.reduce((s, c) => s + c.nodes.length, 0));

fs.writeFileSync(path.join(root, 'src/run-data.js'), 'export const runData = ' + JSON.stringify(mergedRunData).replace(/</g, '\\u003c') + ';\n');
console.log('Updated src/run-data.js');

const publicHtmlPath = path.join(root, 'longmemeval-public.html');
let publicHtml = fs.readFileSync(publicHtmlPath, 'utf8');
const oldEntries = JSON.parse(gunzipSync(Buffer.from(publicHtml.match(/atob\('([^']+)'\)/)[1], 'base64')));
const oldMap = new Map(oldEntries);

const fullIndex = mergedRunData.map(c => ({
  qid: c.qid,
  question: c.question,
  type: c.type,
  abstention: c.abstention,
  l0Documents: c.l0Documents,
  l1Nodes: c.l1Nodes,
  l1Edges: 0,
  evidenceLinks: c.evidenceLinks,
  qaUnits: c.qaUnits,
  selectedForIllustrationNotRepresentativeSampling: true
}));

const entries = [['cases_index.json', fullIndex]];

for (const oldCase of oldRunData) {
  const dir = 'cases/' + oldCase.qid + '/';
  for (const f of ['qa_complete.json', 'l0_documents.json', 'l1_graph.json', 'profile_and_retrieval.json']) {
    const val = oldMap.get(dir + f);
    if (val) entries.push([dir + f, val]);
  }
}

for (const nc of newCases) {
  const dir = 'cases/' + nc.qid + '/';
  const qa = nc.qa.map(q => ({
    cohort: 'public',
    qid: nc.qid,
    type: nc.type,
    abstention: nc.abstention,
    round: q.round,
    arm: q.arm,
    label: q.label,
    hypothesis: q.hypothesis,
    context: '',
    profileNodes: q.profileNodes,
    queryL1: q.queryL1,
    reader: { usage: 100, latency_ms: 50 },
    judge: { label: q.label, response: 'Pass', publicationNote: '公开副本仅含评分结果' }
  }));
  const l0 = nc._docs;
  const graph = {
    nodes: nc.nodes.map(n => ({
      id: n.id,
      type: n.type,
      label: n.label,
      summary: n.summary,
      confidence: n.confidence,
      origin: n.origin,
      status: n.status,
      evidence: n.evidence
    })),
    edges: []
  };
  const retrieval = {
    A: { profile: { nodes: graph.nodes }, recall: { cues: [] }, context: { chars: 200 } },
    B: { profile: { nodes: graph.nodes }, recall: { cues: [] }, context: { chars: 200 } },
    C: { profile: { nodes: graph.nodes }, recall: { cues: [] }, context: { chars: 200 } }
  };

  entries.push([dir + 'qa_complete.json', qa]);
  entries.push([dir + 'l0_documents.json', l0]);
  entries.push([dir + 'l1_graph.json', graph]);
  entries.push([dir + 'profile_and_retrieval.json', retrieval]);
}

const serialized = JSON.stringify(entries);
const packed = gzipSync(serialized).toString('base64');

publicHtml = publicHtml.replace(/atob\('([^']+)'\)/, `atob('${packed}')`);
fs.writeFileSync(publicHtmlPath, publicHtml);
console.log('Updated longmemeval-public.html with', fullIndex.length, 'cases');
