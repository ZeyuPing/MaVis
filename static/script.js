// 保存当前公式用于比较
let currentFormula = '';

// 初始化帮助对话框
function initHelpModal() {
    const modal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpButton');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 点击问号按钮打开对话框
    helpBtn.onclick = function() {
        modal.style.display = 'block';
    }

    // 点击 × 关闭对话框
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // 点击对话框外部关闭对话框
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// 获取图形设置参数
function getPlotSettings() {
    return {
        x_min: parseFloat(document.getElementById('x_min').value),
        x_max: parseFloat(document.getElementById('x_max').value),
        y_min: parseFloat(document.getElementById('y_min').value),
        y_max: parseFloat(document.getElementById('y_max').value),
        points: parseInt(document.getElementById('points').value),
        color_scale: document.getElementById('color_scale').value,
        axis_fixed: document.getElementById('axis_fixed').checked
    };
}

// 验证设置参数
function validateSettings(settings) {
    if (settings.x_min >= settings.x_max) {
        alert('X最小值必须小于最大值');
        return false;
    }
    if (settings.y_min >= settings.y_max) {
        alert('Y最小值必须小于最大值');
        return false;
    }
    if (settings.points < 10 || settings.points > 200) {
        alert('点数必须在10到200之间');
        return false;
    }
    return true;
}

// 绘制公式
function plotFormula() {
    const formula = document.getElementById('formula').value;
    if (!formula) {
        alert('请输入公式');
        return;
    }
    
    const settings = getPlotSettings();
    if (!validateSettings(settings)) {
        return;
    }
    
    // 检查公式是否发生变化
    const formulaChanged = formula !== currentFormula;
    
    fetch('/plot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            formula: formula,
            save_to_history: formulaChanged, // 只在公式改变时保存历史记录
            ...settings
        })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data === 'string') {
            // 如果返回的是错误信息
            alert('错误: ' + data);
        } else {
            Plotly.newPlot('plot', data.data, data.layout);
            if (formulaChanged) {
                currentFormula = formula;
                loadHistory(); // 只在公式改变时刷新历史记录
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('生成图形时出错，请检查公式格式');
    });
}

// 加载历史记录
function loadHistory() {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';
            data.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const formulaText = document.createElement('span');
                formulaText.className = 'formula-text';
                formulaText.textContent = item.formula;
                formulaText.onclick = () => setFormula(item.formula);
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteFormula(item.id);
                
                historyItem.appendChild(formulaText);
                historyItem.appendChild(deleteButton);
                historyList.appendChild(historyItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('加载历史记录失败');
        });
}

// 删除公式
function deleteFormula(id) {
    fetch(`/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadHistory();
        } else {
            alert('删除公式失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('删除公式失败');
    });
}

// 设置公式
function setFormula(formula) {
    document.getElementById('formula').value = formula;
    plotFormula();
}

// 页面加载时加载历史记录
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    initHelpModal();
    
    // 添加参数变化时自动更新图形的监听器
    const settingInputs = [
        'x_min', 'x_max', 'y_min', 'y_max',
        'points', 'color_scale', 'axis_fixed'
    ];
    
    settingInputs.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('change', () => {
            const formula = document.getElementById('formula').value;
            if (formula) {
                plotFormula();
            }
        });
    });
});

// 为公式输入框添加回车键监听
document.getElementById('formula').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        plotFormula();
    }
});