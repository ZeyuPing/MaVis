# Math Vis - 3D数学公式可视化工具

这是一个基于Flask的Web应用程序，可以将数学公式转换为交互式3D可视化图形。用户可以输入数学公式，系统会实时生成对应的3D图形，并支持历史记录管理。

## 功能特点

- 支持任意包含x和y变量的数学公式的3D可视化
- 交互式3D图形展示，支持旋转、缩放和平移
- 公式历史记录保存和管理
- 支持一键复用历史公式
- 内置常用公式示例
- 响应式设计，适配各种设备

## 技术栈

- 后端：Flask (Python)
- 前端：HTML5, CSS3, JavaScript
- 数据可视化：Plotly.js
- 数学计算：NumPy, SymPy
- 数据存储：SQLite3

## 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/your-username/math_vis.git
cd math_vis
```

2. 创建并激活虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 运行应用：
```bash
python app.py
```

5. 访问应用：
打开浏览器访问 http://localhost:5000

## 依赖项

- Flask==3.0.2
- numpy==1.26.4
- matplotlib==3.8.3
- pandas==2.2.1
- scipy==1.12.0
- Pillow==10.2.0
- plotly==5.19.0
- sympy==1.12

## API 接口说明

### 1. 主页面
- 路由：`GET /`
- 功能：渲染主页面
- 返回：HTML页面

### 2. 生成3D图形
- 路由：`POST /plot`
- 功能：根据提供的公式生成3D图形数据
- 请求体：
  ```json
  {
    "formula": "数学公式字符串"
  }
  ```
- 返回：Plotly图形JSON数据

### 3. 获取历史记录
- 路由：`GET /history`
- 功能：获取所有已保存的公式记录
- 返回：JSON格式的历史记录列表
  ```json
  [
    {
      "id": "记录ID",
      "formula": "公式内容",
      "created_at": "创建时间"
    }
  ]
  ```

### 4. 删除历史记录
- 路由：`DELETE /delete/<formula_id>`
- 功能：删除指定ID的公式记录
- 返回：
  ```json
  {
    "success": true
  }
  ```

## 快速开始

1. 启动应用后，访问主页面
2. 在输入框中输入数学公式，例如：`x**2 + y**2`
3. 点击"生成图形"按钮或按回车键
4. 3D图形将会显示在下方
5. 可以使用鼠标进行以下操作：
   - 左键拖动：旋转视角
   - 右键拖动：平移视角
   - 滚轮：缩放视图

## 支持的数学表达式

- 基本运算：`+`, `-`, `*`, `/`, `**`（幂）
- 数学函数：`sin()`, `cos()`, `tan()`, `sqrt()`, `exp()`, `log()`
- 变量：`x`, `y`（公式中必须包含这两个变量）
- 示例：
  - `x**2 + y**2`（抛物面）
  - `sin(x) + cos(y)`（波浪面）
  - `sqrt(x**2 + y**2)`（圆锥面）

## 开发指南

### 项目结构
```
math_vis/
├── app.py              # Flask应用主文件
├── requirements.txt    # 项目依赖
├── formulas.db        # SQLite数据库文件
├── static/
│   ├── script.js      # 前端JavaScript
│   └── style.css      # 样式表
└── templates/
    └── index.html     # 主页面模板
```

### 添加新功能

1. 后端扩展
- 在 `app.py` 中添加新的路由和处理函数
- 使用 `create_3d_plot()` 函数处理新的图形生成需求

2. 前端扩展
- 在 `script.js` 中添加新的交互功能
- 在 `style.css` 中添加新的样式
- 在 `index.html` 中添加新的页面元素

## 注意事项

1. 性能考虑
- 复杂的数学表达式可能需要较长处理时间
- 点数过多会影响渲染性能，默认设置为50x50个点
- 建议在开发环境下不要使用过大的计算范围

2. 安全考虑
- 系统会验证输入的数学表达式
- 使用 `sympify` 进行安全的表达式解析
- 数据库操作使用参数化查询防止SQL注入

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证