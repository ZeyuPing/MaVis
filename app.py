from flask import Flask, render_template, request, jsonify
import numpy as np
from sympy import sympify, lambdify, symbols
import plotly.graph_objects as go
import sqlite3
import json

app = Flask(__name__)

def create_3d_plot(formula, x_range=(-5, 5), y_range=(-5, 5), points=50, color_scale='Viridis', scene_camera=None):
    x, y = symbols('x y')
    
    try:
        # 将字符串公式转换为sympy表达式
        expr = sympify(formula)
        
        # 创建数值计算函数
        f = lambdify((x, y), expr)
        
        # 创建网格点
        x_vals = np.linspace(x_range[0], x_range[1], points)
        y_vals = np.linspace(y_range[0], y_range[1], points)
        x_mesh, y_mesh = np.meshgrid(x_vals, y_vals)
        
        # 计算z值
        z_mesh = f(x_mesh, y_mesh)
        
        # 创建3D图形
        fig = go.Figure(data=[go.Surface(
            x=x_mesh, 
            y=y_mesh, 
            z=z_mesh,
            colorscale=color_scale
        )])
        
        # 更新布局
        layout_settings = {
            'scene': {
                'xaxis': {'title': 'X'},
                'yaxis': {'title': 'Y'},
                'zaxis': {'title': 'Z'}
            },
            'title': f'3D Plot of {formula}'
        }
        
        # 如果提供了相机设置，则使用它
        if scene_camera:
            layout_settings['scene']['camera'] = scene_camera
            
        fig.update_layout(**layout_settings)
        
        return json.loads(fig.to_json())
    except Exception as e:
        return str(e)

def init_db():
    conn = sqlite3.connect('formulas.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS formulas
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         formula TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/plot', methods=['POST'])
def plot():
    data = request.get_json()
    formula = data.get('formula')
    
    # 获取可视化参数
    x_range = (float(data.get('x_min', -5)), float(data.get('x_max', 5)))
    y_range = (float(data.get('y_min', -5)), float(data.get('y_max', 5)))
    points = int(data.get('points', 50))
    color_scale = data.get('color_scale', 'Viridis')
    scene_camera = data.get('scene_camera', None)
    
    # 生成图形
    plot_data = create_3d_plot(
        formula, 
        x_range=x_range,
        y_range=y_range,
        points=points,
        color_scale=color_scale,
        scene_camera=scene_camera
    )

    # 检查是否需要保存到历史记录
    save_to_history = data.get('save_to_history', True)
    if save_to_history:
        conn = sqlite3.connect('formulas.db')
        c = conn.cursor()
        c.execute('SELECT id FROM formulas WHERE formula = ?', (formula,))
        existing = c.fetchone()
        
        if not existing:
            c.execute('INSERT INTO formulas (formula) VALUES (?)', (formula,))
            conn.commit()
        conn.close()
    
    return jsonify(plot_data)

@app.route('/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect('formulas.db')
    c = conn.cursor()
    c.execute('SELECT * FROM formulas ORDER BY created_at DESC')
    formulas = c.fetchall()
    conn.close()
    return jsonify([{'id': f[0], 'formula': f[1], 'created_at': f[2]} for f in formulas])

@app.route('/delete/<int:formula_id>', methods=['DELETE'])
def delete_formula(formula_id):
    conn = sqlite3.connect('formulas.db')
    c = conn.cursor()
    c.execute('DELETE FROM formulas WHERE id = ?', (formula_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)