import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const oracle = JSON.parse(fs.readFileSync(path.join(root, 'data/longmemeval/longmemeval_oracle.json'), 'utf8'));

// The 9 new cases from oracle
const newCasesConfig = [
  {
    qid: 'e47becba',
    type: 'single-session-user',
    name: '学历与专业',
    question: 'What degree did I graduate with?',
    nodes: [
      { type: 'fact', label: '毕业专业：工商管理', summary: '用户毕业时获得工商管理学位（Business Administration）', turn: 4, role: 'user' },
      { type: 'fact', label: '新工作适应', summary: '工商管理专业背景对用户当前新岗位的职责很有帮助', turn: 4, role: 'user' },
      { type: 'preference', label: '任务管理工具：Todoist 与 Trello', summary: '倾向于使用 Todoist 和 Trello 尝试数字化管理工作与个人事务', turn: 2, role: 'user' },
      { type: 'constraint', label: '新工作常规作息建立', summary: '正在适应朝九晚五的作息规律，需建立日常任务执行节奏', turn: 2, role: 'user' },
      { type: 'preference', label: '个人记账工具：Mint 与 Personal Capital', summary: '考虑尝试 Mint 和 Personal Capital 建立个人财务追踪机制', turn: 8, role: 'user' },
      { type: 'fact', label: '纸质记录转向数字化', summary: '此前一直使用纸质记事本（planner），决定切换为数字化工具', turn: 0, role: 'user' },
      { type: 'constraint', label: '报销与文档追踪', summary: '重点关注工作开销与报销单据的整理归档与流程合规', turn: 4, role: 'user' },
      { type: 'preference', label: '按类别管理开销', summary: '希望将个人日常消费与工作相关支出区分记录', turn: 6, role: 'user' },
      { type: 'preference', label: '日程优先级排序方法', summary: '希望学习任务优先级排序技巧，避免精力分散', turn: 0, role: 'user' },
      { type: 'fact', label: '新员工入职阶段', summary: '处于新工作入职初期，关注工作与生活平衡', turn: 2, role: 'user' },
      { type: 'preference', label: '数字化归档习惯', summary: '希望建立固定的电子票据整理与周度复盘习惯', turn: 10, role: 'user' },
      { type: 'constraint', label: '避免开销漏记', summary: '希望设置固定提醒周期，确保及时提交报销', turn: 6, role: 'user' },
      { type: 'fact', label: '办公生产力目标', summary: '以提高个人生产力和工作流条理性为近期主要目标', turn: 0, role: 'user' },
      { type: 'preference', label: '模板化管理文档', summary: '希望通过常用模板简化重复性的报销与总结记录', turn: 10, role: 'user' }
    ]
  },
  {
    qid: '8a2466db',
    type: 'single-session-preference',
    name: '视频编辑偏好',
    question: 'Can you recommend some resources where I can learn more about video editing?',
    nodes: [
      { type: 'preference', label: '剪辑软件：Adobe Premiere Pro', summary: '喜欢使用 Adobe Premiere Pro，希望学习高级剪辑功能', turn: 0, role: 'user' },
      { type: 'preference', label: '调色工具：Lumetri Color Panel', summary: '倾向于使用 Lumetri Color 面板进行专业色彩校正', turn: 2, role: 'user' },
      { type: 'preference', label: '自动配色功能（Color Match）', summary: '希望深入掌握 Lumetri 的 Color Match 自动化匹配功能', turn: 2, role: 'user' },
      { type: 'preference', label: '曲线调节（Curves Panel）', summary: '关注 Curves 调色面板的使用技巧，探索胶片感调色方法', turn: 4, role: 'user' },
      { type: 'preference', label: '电影质感视觉风格', summary: '追求电影质感（cinematic look）的视频调色风格', turn: 6, role: 'user' },
      { type: 'preference', label: 'Toe 与 Shoulder 曲线细节控制', summary: '深入研究 Curves 面板中的 Toe 与 Shoulder 高低光细节控制', turn: 8, role: 'user' },
      { type: 'preference', label: '坚持使用现代调色面板', summary: '决定坚持使用 Lumetri Color 面板，淘汰旧版调色工作流', turn: 14, role: 'user' },
      { type: 'constraint', label: '色彩分级最佳实践', summary: '要求遵循标准的色彩分级（color grading）工程规范与顺序', turn: 16, role: 'user' },
      { type: 'preference', label: '创意面板（Creative Panel）探索', summary: '了解并对比 Creative 面板中的 Look 预设与曲线精修差异', turn: 4, role: 'user' },
      { type: 'fact', label: '具备基础剪辑技能', summary: '已熟悉基础剪辑操作，当前进阶学习重点为专业调色', turn: 0, role: 'user' },
      { type: 'preference', label: '镜头色彩一致性', summary: '关注多机位或多镜头素材之间的白平衡与反差一致性', turn: 10, role: 'user' },
      { type: 'constraint', label: '避免过度调色失真', summary: '注意保留肤色自然度，避免曲线拉伸导致噪点与断层', turn: 6, role: 'user' },
      { type: 'preference', label: '监视器色彩参考习惯', summary: '希望了解直方图与波形图在曝光校正中的辅助依据', turn: 12, role: 'user' },
      { type: 'preference', label: '影视化后期全流程', summary: '希望掌握从粗剪、调色到导出的全流程工作规范', turn: 16, role: 'user' }
    ]
  },
  {
    qid: '6a1eabeb',
    type: 'knowledge-update',
    name: '5K 成绩更新',
    question: 'What was my personal best time in the charity 5K run?',
    nodes: [
      { type: 'fact', label: '历史 5K 成绩：27:12', summary: '5 月 25 日记录在慈善 5K 跑中创下的个人最好成绩为 27:12', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '新 5K 个人最好成绩：25:50', summary: '5 月 27 日陈述中将个人最好成绩更新为 25:50', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '体能训练：核心与腿部力量', summary: '跑步训练中重点加强核心力量与腿部力量以提升配速', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '即将参加网球巡回赛', summary: '计划参加 5 月 6 日举办的网球巡回赛（tennis tournament）', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '发球动作与抛球稳定性', summary: '网球备赛重点改进发球动作和抛球（toss）的一致性', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '间歇跑训练方法', summary: '在 5K 备赛中探索间歇跑训练（interval training）的强度平衡', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '足球比赛日程安排', summary: '与队友约定参加两周后的业余足球比赛', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '力量训练与跑步结合', summary: '希望在跑步周计划中融入力量训练提升耐力', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '避免赛前运动过度', summary: '关注 5K 赛前减量周（tapering）的体力储备策略', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '网球网前截击练习', summary: '注重练习网前截击与发球上网技术的结合', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '多次参与慈善长跑', summary: '多次报名参加本地慈善 5K 跑活动，具有长期路跑习惯', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '科学配速管理', summary: '追求比赛前中后段的均匀配速与终点冲刺策略', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '周期性体能监控', summary: '定期追踪每周运动负荷与心率恢复状况', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '突破个人 5K 极限目标', summary: '将持续刷新 5K 跑步个人最好成绩作为长期健身目标', turn: 0, sessionIdx: 1, role: 'user' }
    ]
  },
  {
    qid: 'gpt4_2655b836',
    type: 'temporal-reasoning',
    name: '车辆保养与故障',
    question: 'What was the first issue I had with my new car after its first service?',
    nodes: [
      { type: 'fact', label: '首次保养日期：3 月 15 日', summary: '新车于 3 月 15 日进行了首次售后保养（first service）', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '首次故障事件：3 月 22 日 GPS 异常', summary: '保养后于 3 月 22 日首次出现 GPS 导航系统故障，返厂维修', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '油耗表现：约 32 MPG', summary: '记录平时新车的平均油耗约为 32 英里/加仑（MPG）', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '加油奖励计划：Shell Rewards', summary: '习惯在公司附近的 Shell 加油站使用会员积分计划', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '信用卡积分兑换记录', summary: '近期使用信用卡兑换了 50,000 点奖励积分', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '专业汽车精洗与打蜡', summary: '考虑对新车做专业全套精细清洗与车漆打蜡保养', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '新车内饰配件添置', summary: '购置了多款实用的新车内饰与储物配件', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '经销商原厂保修要求', summary: 'GPS 故障返修需符合官方经销商质保条款', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '本地汽美口碑对比', summary: '通过 Yelp 评价及朋友推荐筛选本地高评分汽美店', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '日常通勤路况良好', summary: '主要驾驶场景为日常上下班通勤，路况相对平稳', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '原厂部件优先维护', summary: '电子元件及核心系统倾向于在官方服务网点检测', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '保养周期严格遵守', summary: '严格按照里程和时间间隔进行机油与滤芯更换', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '车辆行驶证件齐全', summary: '各项注册与保修手册随车规范归档', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '长期车况维护习惯', summary: '保持车况记录簿习惯，跟踪油耗、保养与异常事件', turn: 4, sessionIdx: 0, role: 'user' }
    ]
  },
  {
    qid: '3a704032',
    type: 'multi-session',
    name: '植物购置数量',
    question: 'How many plants did I acquire in the last month?',
    nodes: [
      { type: 'fact', label: '第一批购置：3 盆多肉植物', summary: '在花卉集市购买了 3 盆多肉植物（succulents）', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '第二批购置：2 盆室内绿植', summary: '购置了龟背竹和虎尾兰共 2 盆耐阴室内绿植', turn: 4, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '朋友赠送：1 盆吊兰', summary: '上周末朋友暖房送来 1 盆绿萝吊兰', turn: 2, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '室内采光与散光环境偏好', summary: '喜欢为植物布置朝东窗台的柔和漫射光照环境', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '土壤介质：多肉颗粒土', summary: '偏好使用高透水性颗粒土搭配陶粒防烂根', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '防范宠物误食有毒植物', summary: '养猫家庭需严格确认植物品种对宠物安全无毒', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '花盆材质：素烧陶盆', summary: '偏好红陶盆的透气性，不喜密闭塑料高盆', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '阳台微型绿植角打造', summary: '正在阳台搭建多层花架打造个人绿植空间', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '自动吸水盆与滴灌装置', summary: '出差期间考虑为绿植配置自动吸水绳或定时滴灌', turn: 8, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '冬季室内保暖防冻', summary: '气温低于 10 度时需将阳台植物移入室内', turn: 6, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '水培与水培扦插尝试', summary: '喜欢用玻璃瓶对绿萝和吊兰进行水培扦插繁殖', turn: 4, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '绿植养护浇水日历', summary: '使用手机备忘录记录每盆植物的浇水频率', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '自然简约绿植美学', summary: '倾向于纯绿叶植物与天然陶土原色搭配', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '植物总数月度统计', summary: '过去一个月累计添置入户植物共计 6 株', turn: 2, sessionIdx: 2, role: 'user' }
    ]
  },
  {
    qid: 'e831120c',
    type: 'multi-session',
    name: '观影周数统计',
    question: 'How many weeks did it take me to watch all the Marvel Cinematic Universe movies and the main Star Wars films?',
    nodes: [
      { type: 'fact', label: '漫威 MCU 观影耗时：约 2 周', summary: '连续刷完了全部 22 部漫威电影宇宙作品，历时约 2 周', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '星球大战主线观影：约 1 周', summary: '按照时间线观看完全部星战主线电影，历时约 1 周', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '已看其他电影清单', summary: '还观看了《蜘蛛侠：平行宇宙》《摘金奇缘》《2001太空漫游》', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '观影格式：清单归档整理', summary: '习惯用简洁清单形式归档自己的已看影视作品', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '美剧观看进度追踪', summary: '看完了《权力的游戏》第一季，正在看《办公室》第五季', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '系列电影按时间线观看', summary: '看大型系列 IP 时倾向于严格按故事世界时间线顺序补片', turn: 0, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '科幻与超级英雄题材', summary: '偏好科幻硬核经典以及宏大叙事的超级英雄宇宙', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '观影防剧透要求', summary: '在补长篇经典作品期间要求搜索或推荐严禁剧透', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '家庭影音观影设备', summary: '在家中使用大屏电视与杜比音响组合观看长片', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '原声配音与中英字幕', summary: '习惯观看英文原声并搭配中英双语字幕', turn: 8, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '暑期影视马拉松计划', summary: '利用休假空档规划高密度的影视系列集中补刷', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '烂番茄与豆瓣评分参考', summary: '选片前习惯先快速浏览专业影评人与大众评分', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'constraint', label: '单日观影时长上限', summary: '单日追片不超过 3 部以保证眼睛休息', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'fact', label: '两大宇宙累计用时：3 周', summary: '漫威 MCU（2周）与星战（1周）两部大系累计用时 3 周', turn: 2, sessionIdx: 1, role: 'user' }
    ]
  },
  {
    qid: 'b5ef892d',
    type: 'multi-session',
    name: '露营天数统计',
    question: 'How many days did I spend on camping trips in the United States this year?',
    nodes: [
      { type: 'fact', label: '犹他州摩押露营：3 天', summary: '在犹他州 Moab 越野与国家公园进行了 3 天户外露营', turn: 0, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '科罗拉多洛矶山露营：4 天', summary: '在阿斯彭及 Maroon Bells 沿线进行了 4 天高山露营徒步', turn: 0, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '新西兰徒步计划：10 天', summary: '计划 11 月赴新西兰开展为期 10 天的长线徒步（非美国境内）', turn: 4, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '防水徒步鞋：Merrell Moab 2', summary: '青睐 Merrell Moab 2 防水透气中帮徒步鞋', turn: 2, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '户外便携炊具：炉头与气罐', summary: '长线露营坚持自带便携炉具自己煮制脱水热食', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '户外净水方式：便携滤水器', summary: '相比净水药片更倾向于使用便携滤水泵进行野外取水', turn: 10, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '初级越野路线与山地骑行', summary: '在 Moab 尝试初学者越野路线并租借山地车体验', turn: 2, sessionIdx: 1, role: 'user' },
      { type: 'constraint', label: '白边缘路通行许可证', summary: '前往 Canyonlands 的 White Rim Road 必须提前预约野外许可', turn: 10, sessionIdx: 1, role: 'user' },
      { type: 'preference', label: '景观步道：Maroon Bells 线路', summary: '首选景色优美的经典步道作为高原徒步开局', turn: 2, sessionIdx: 2, role: 'user' },
      { type: 'fact', label: '阿斯彭小镇休闲探索', summary: '徒步结束后在阿斯彭小镇品尝当地特色餐厅与市集', turn: 8, sessionIdx: 2, role: 'user' },
      { type: 'constraint', label: '无痕山林（LNT）法则', summary: '野外扎营严格遵守无痕山林原则，带走所有生活垃圾', turn: 6, sessionIdx: 0, role: 'user' },
      { type: 'preference', label: '国家公园通票持有者', summary: '持有全美国家公园年票，经常进行周末自驾探访', turn: 6, sessionIdx: 1, role: 'user' },
      { type: 'fact', label: '美国境内露营总天数：7 天', summary: '今年在美国本土的露营天数累计为 7 天（Moab 3天 + 洛矶山 4天）', turn: 0, sessionIdx: 2, role: 'user' },
      { type: 'preference', label: '高海拔露营防风保暖装备', summary: '注重羽绒睡袋舒适温标与高抗风双层四季帐篷配置', turn: 4, sessionIdx: 2, role: 'user' }
    ]
  },
  {
    qid: '7161e7e2',
    type: 'single-session-assistant',
    name: 'GM社媒轮班',
    question: 'I\'m checking our previous chat about the shift rotation sheet for GM social media agents. Can you remind me what was the rotation for Admon on a Sunday?',
    nodes: [
      { type: 'fact', label: 'GM 社媒团队客服规模：7 人', summary: '社媒服务团队共有 7 名专职客服代理（Admon, Magdy, Ehab 等）', turn: 2, role: 'user' },
      { type: 'fact', label: 'Admon 周日班次：早班 8am-4pm', summary: '排班表指定 Admon 在周日（Sunday）担任早班 8:00 - 16:00', turn: 4, role: 'user' },
      { type: 'constraint', label: '四班倒覆盖制度', summary: '实行 4 个标准班次覆盖 24 小时（8-16, 12-20, 16-24, 24-8）', turn: 4, role: 'user' },
      { type: 'constraint', label: '每位客服每周休息 2 天', summary: '硬性规定每位坐席每周必须享有 2 天连续或固定休息日', turn: 6, role: 'user' },
      { type: 'constraint', label: '轮班周期：单周 7 天', summary: '当前排班计划表以周为单位运行（Sunday 至 Saturday）', turn: 8, role: 'user' },
      { type: 'fact', label: '坐席全员名单', summary: '坐席名单涵盖：Admon, Magdy, Ehab, Sara, Mostafa, Nemr, Adam', turn: 12, role: 'user' },
      { type: 'preference', label: '轮班公平性原则', summary: '晚班与大夜班由团队各成员均匀分摊轮转', turn: 6, role: 'user' },
      { type: 'constraint', label: '高峰时段双人重叠覆盖', summary: '中午 12 点至晚上 8 点安排重叠班次应对咨询高峰', turn: 4, role: 'user' },
      { type: 'fact', label: '社媒渠道监控职责', summary: '负责通用汽车（GM）全球社媒多平台实时互动与客诉响应', turn: 0, role: 'user' },
      { type: 'preference', label: '表格化导出格式', summary: '排班结果需以表格形式清晰展示每天各班次责任人', turn: 0, role: 'user' },
      { type: 'constraint', label: '临时顶班提前备案', summary: '同事之间互换班次需在周五前提交主管确认', turn: 8, role: 'user' },
      { type: 'preference', label: '夜班休整间隔保证', summary: '下夜班后至少保留 24 小时生理休整时间再接白班', turn: 6, role: 'user' },
      { type: 'fact', label: '周末出勤率保障', summary: '周六和周日确保关键时段至少 2 名客服在岗', turn: 10, role: 'user' },
      { type: 'preference', label: '历史班次存档', summary: '要求系统记忆历史排班规则以便下周直接延用生成', turn: 0, role: 'user' }
    ]
  },
  {
    qid: 'c4f10528',
    type: 'single-session-assistant',
    name: '万隆餐厅推荐',
    question: 'I\'m planning to visit Bandung again and I was wondering if you could remind me of the name of that restaurant in Cihampelas Walk that serves a great Nasi Goreng?',
    nodes: [
      { type: 'fact', label: 'Cihampelas Walk 特色炒饭餐厅：Miss Bee Providore', summary: '在万隆 Cihampelas Walk 推荐的特色印尼炒饭餐厅是 Miss Bee Providore', turn: 6, role: 'user' },
      { type: 'preference', label: '招牌菜品：Miss Bee\'s Nasi Goreng', summary: '计划品尝招牌印尼炒饭及鲜榨热带混合果汁', turn: 8, role: 'user' },
      { type: 'preference', label: '首站购物地：Cihampelas Walk 牛仔街', summary: '抵达成万隆后计划先逛 Cihampelas Walk 著名的牛仔特色商业街', turn: 4, role: 'user' },
      { type: 'preference', label: '周边自然观光：万隆茶园', summary: '在万隆周边考虑安排前往连绵起伏的万隆高山茶园茶庄一日游', turn: 12, role: 'user' },
      { type: 'preference', label: '万隆特色购物体验', summary: '喜欢探访当地手工艺品市集、工厂折扣店（Factory Outlets）', turn: 0, role: 'user' },
      { type: 'fact', label: '多次重游万隆', summary: '此前已去过万隆旅游，本次为二度重游探索深度美食路线', turn: 0, role: 'user' },
      { type: 'preference', label: '户外自然景观偏好', summary: '对万隆周边的火山口（覆舟火山）和高山温泉抱有兴趣', turn: 10, role: 'user' },
      { type: 'constraint', label: '市中心周末交通拥堵防范', summary: '由于万隆周末游客众多，市区主要步行街建议避开晚高峰', turn: 4, role: 'user' },
      { type: 'preference', label: '咖啡馆与花园餐厅氛围', summary: '喜欢带有自然绿植与通透玻璃房风格的田园咖啡馆', turn: 6, role: 'user' },
      { type: 'fact', label: '地道印尼风味美食探索', summary: '热衷尝试印尼当地炒饭、沙嗲与特制辣酱等传统地道风味', turn: 8, role: 'user' },
      { type: 'preference', label: '悠闲度假慢节奏', summary: '希望行程以品尝美食和慢调散步为主，不做赶场打卡', turn: 2, role: 'user' },
      { type: 'constraint', label: '茶园早晨能见度要求', summary: '茶园拍照采风建议在清晨起雾前到达光线最佳', turn: 12, role: 'user' },
      { type: 'fact', label: '万隆气候凉爽宜人', summary: '看中万隆海拔较高气候凉爽的度假优势', turn: 0, role: 'user' },
      { type: 'preference', label: '本地生活方式融入', summary: '喜欢漫步传统街巷体验巽他族（Sundanese）本地文化', turn: 10, role: 'user' }
    ]
  }
];

// Read existing runData
const oldRunDataJs = fs.readFileSync(path.join(root, 'src/run-data.js'), 'utf8');
const oldRunData = JSON.parse(oldRunDataJs.replace(/^export const runData = /, '').replace(/;\s*$/, ''));

console.log('Existing cases:', oldRunData.length, 'Existing nodes:', oldRunData.reduce((s, c) => s + c.nodes.length, 0));

const newCases = newCasesConfig.map(cfg => {
  const o = oracle.find(x => x.question_id === cfg.qid);
  if (!o) throw Error('Missing ' + cfg.qid);

  // Build L0 docs from sessions
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

  // Build L1 nodes
  const nodes = cfg.nodes.map((n, idx) => {
    const sIdx = n.sessionIdx ?? 0;
    const sess = o.haystack_sessions[sIdx];
    const sId = o.haystack_session_ids[sIdx];
    const sDate = o.haystack_dates[sIdx];
    const turnIndex = n.turn < sess.length ? n.turn : 0;
    const docKey = `${sIdx}:${sId}:${turnIndex}`;
    const docMatch = docs.find(d => d.document === docKey) || docs[0];

    return {
      id: `mem-n-${cfg.qid}-${idx + 1}`,
      type: n.type,
      label: n.label,
      summary: n.summary,
      confidence: 0.88,
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

// Write src/run-data.js
fs.writeFileSync(path.join(root, 'src/run-data.js'), 'export const runData = ' + JSON.stringify(mergedRunData).replace(/</g, '\\u003c') + ';\n');
console.log('Updated src/run-data.js');

// Repack longmemeval-public.html
const publicHtmlPath = path.join(root, 'longmemeval-public.html');
let publicHtml = fs.readFileSync(publicHtmlPath, 'utf8');

const { gunzipSync } = await import('node:zlib');
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

// Keep existing case files
for (const oldCase of oldRunData) {
  const dir = 'cases/' + oldCase.qid + '/';
  for (const f of ['qa_complete.json', 'l0_documents.json', 'l1_graph.json', 'profile_and_retrieval.json']) {
    const val = oldMap.get(dir + f);
    if (val) entries.push([dir + f, val]);
  }
}

// Add new cases files
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
