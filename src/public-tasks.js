export const publicTasks = [
  {
    "id": "357ef137-7eeb-4c80-a3bb-0951f26a8aff",
    "title": "工时与时薪计算",
    "instruction": "I have calculated the total work hours from the everday hours. And I have an hourly rate. Now I want to multiply the total hours with the hourly rate to get a total earned amount. However, I can't get a correct answer by directly multiply the two cells. Here the \"total hours\" is of time and \"hourly rate\" is just a number. How can I get the correct product of them? Help me fill in the cell the correct answer. Don't touch irrelevant blank regions.",
    "application": "LibreOffice Calc",
    "origin": "OSWorld · 官方任务定义",
    "provenance": "public-definition",
    "executionStatus": "未执行",
    "use": "把“单元格类型与业务单位”作为经验中的前置检查条件。",
    "infeasible": false,
    "url": "https://github.com/xlang-ai/OSWorld/blob/main/evaluation_examples/examples/libreoffice_calc/357ef137-7eeb-4c80-a3bb-0951f26a8aff.json"
  },
  {
    "id": "42e0a640-4f19-4b28-973d-729602b5a4a7",
    "title": "收入与支出汇总",
    "instruction": "Compute the sum of \"Revenue\" and \"Total Expenses\" and put the results under two columns named \"Total Revenue\" and \"Total Expenses\" of a new sheet (Sheet2)",
    "application": "LibreOffice Calc",
    "origin": "OSWorld · 官方任务定义",
    "provenance": "public-definition",
    "executionStatus": "未执行",
    "use": "展示输入区域、输出工作表与原始数据保护。",
    "infeasible": false,
    "url": "https://github.com/xlang-ai/OSWorld/blob/main/evaluation_examples/examples/libreoffice_calc/42e0a640-4f19-4b28-973d-729602b5a4a7.json"
  },
  {
    "id": "51719eea-10bc-4246-a428-ac7c433dd4b3",
    "title": "产品收入透视汇总",
    "instruction": "Calculate revenue in a new column according to the Retail Price sheet (consider product price and quantity and discount), and generate a Pivot Table in a new sheet (Sheet2) that summarizes the revenue of each product.",
    "application": "LibreOffice Calc",
    "origin": "OSWorld · 官方任务定义",
    "provenance": "public-definition",
    "executionStatus": "未执行",
    "use": "展示字段匹配、计算与聚合的多步经验结构。",
    "infeasible": false,
    "url": "https://github.com/xlang-ai/OSWorld/blob/main/evaluation_examples/examples/libreoffice_calc/51719eea-10bc-4246-a428-ac7c433dd4b3.json"
  },
  {
    "id": "1954cced-e748-45c4-9c26-9855b97fbc5e",
    "title": "发票出现次数统计",
    "instruction": "Create a Pivot Table in a new sheet (Sheet2) to count how many times each \"Invoice No.\" appears.",
    "application": "LibreOffice Calc",
    "origin": "OSWorld · 官方任务定义",
    "provenance": "public-definition",
    "executionStatus": "未执行",
    "use": "作为留出迁移候选，检查聚合方式从求和变为计数。",
    "infeasible": false,
    "url": "https://github.com/xlang-ai/OSWorld/blob/main/evaluation_examples/examples/libreoffice_calc/1954cced-e748-45c4-9c26-9855b97fbc5e.json"
  },
  {
    "id": "2bd59342-0664-4ccb-ba87-79379096cc08",
    "title": "订单迷你图",
    "instruction": "Make sparkline charts for each order id with the data from Jan to Mar in the \"Chart\" column.",
    "application": "LibreOffice Calc",
    "origin": "OSWorld · 官方任务定义",
    "provenance": "public-definition",
    "executionStatus": "未执行",
    "use": "显示任务可执行性边界，不把 infeasible 当作成功案例。",
    "infeasible": true,
    "url": "https://github.com/xlang-ai/OSWorld/blob/main/evaluation_examples/examples/libreoffice_calc/2bd59342-0664-4ccb-ba87-79379096cc08.json"
  }
];
