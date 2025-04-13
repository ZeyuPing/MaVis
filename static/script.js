// 保存当前公式用于比较
let currentFormula = '';

// 添加新的公式输入框
function addFormulaInput() {
    const container = document.querySelector('.formula-inputs-container');
    const inputDiv = document.createElement('div');
    inputDiv.className = 'formula-input';
    inputDiv.innerHTML = `
        <div class="input-wrapper">
            <input type="text" class="formula-field" placeholder="Enter a mathematical formula (e.g. x**2 + y**2)">
            <button class="help-button" onclick="showHelp()">?</button>
        </div>
        <button class="remove-formula-btn" onclick="removeFormulaInput(this)">×</button>
    `;
    
    // 将新输入框添加到"添加"按钮之前
    const addButton = container.querySelector('.add-formula-btn');
    container.insertBefore(inputDiv, addButton);
}

// 移除公式输入框
function removeFormulaInput(button) {
    const inputDiv = button.parentElement;
    inputDiv.remove();
}

// 获取所有公式
function getAllFormulas() {
    return Array.from(document.querySelectorAll('.formula-field')).map(input => input.value).filter(formula => formula.trim() !== '');
}

// 初始化帮助对话框
function initHelpModal() {
    const modal = document.getElementById('helpModal');
    const helpBtns = document.getElementsByClassName('help-button');
    const closeBtn = document.getElementsByClassName('close')[0];

    // 为所有帮助按钮添加点击事件
    Array.from(helpBtns).forEach(btn => {
        btn.onclick = function() {
            modal.style.display = 'block';
        }
    });

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

// 显示帮助对话框
function showHelp() {
    const modal = document.getElementById('helpModal');
    modal.style.display = 'block';
}

// 获取图形设置参数
function getPlotSettings() {
    return {
        x_min: parseFloat(document.getElementById('x_min').value),
        x_max: parseFloat(document.getElementById('x_max').value),
        y_min: parseFloat(document.getElementById('y_min').value),
        y_max: parseFloat(document.getElementById('y_max').value),
        points: parseInt(document.getElementById('points').value),
        color_scale: document.getElementById('color_scale').value
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

// 绘制所有公式
function plotAllFormulas() {
    const formulas = getAllFormulas();
    if (formulas.length === 0) {
        alert('请至少输入一个公式');
        return;
    }
    
    const settings = getPlotSettings();
    if (!validateSettings(settings)) {
        return;
    }
    
    // 创建带有多个公式的请求
    const requests = formulas.map(formula => {
        return fetch('/plot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                formula: formula,
                save_to_history: true,
                ...settings
            })
        }).then(response => response.json());
    });
    
    // 等待所有请求完成
    Promise.all(requests)
        .then(results => {
            const traces = results.flatMap((data, index) => {
                if (typeof data === 'string') {
                    alert(`公式 "${formulas[index]}" 错误: ${data}`);
                    return [];
                }
                return data.data;
            });
            
            if (traces.length > 0) {
                // 合并所有图形的数据
                const layout = {
                    ...results[0].layout,
                    title: '多函数对比图'
                };
                Plotly.newPlot('plot', traces, layout);
                loadHistory();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('生成图形时出错');
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

// 设置公式（用于示例）
function setFormula(formula) {
    // 如果没有空的输入框，就添加一个新的
    const emptyInputs = Array.from(document.querySelectorAll('.formula-field')).filter(input => !input.value);
    if (emptyInputs.length === 0) {
        addFormulaInput();
    }
    
    // 找到第一个空的输入框并设置公式
    const inputs = document.querySelectorAll('.formula-field');
    for (let input of inputs) {
        if (!input.value) {
            input.value = formula;
            break;
        }
    }
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    initHelpModal();
    
    // 添加参数变化时自动更新图形的监听器
    const settingInputs = [
        'x_min', 'x_max', 'y_min', 'y_max',
        'points', 'color_scale'
    ];
    
    settingInputs.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('change', () => {
            if (getAllFormulas().length > 0) {
                plotAllFormulas();
            }
        });
    });
});

// 为公式输入框添加回车键监听
document.getElementById('formula').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        plotAllFormulas();
    }
});