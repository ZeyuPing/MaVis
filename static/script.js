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
                
                const formula = document.createElement('div');
                formula.className = 'history-formula';
                formula.textContent = item.formula;
                formula.onclick = () => setFormula(item.formula);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '删除';
                deleteBtn.onclick = () => deleteFormula(item.id);
                
                historyItem.appendChild(formula);
                historyItem.appendChild(deleteBtn);
                historyList.appendChild(historyItem);
            });
        })
        .catch(error => console.error('Error loading history:', error));
}

// 设置公式
function setFormula(formula) {
    document.getElementById('formula').value = formula;
    plotFormula();
}

// 绘制公式
function plotFormula() {
    const formula = document.getElementById('formula').value;
    if (!formula) {
        alert('请输入公式！');
        return;
    }
    
    fetch('/plot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula: formula })
    })
    .then(response => response.json())
    .then(data => {
        if (typeof data === 'string') {
            // 如果返回的是错误信息
            alert('错误: ' + data);
        } else {
            Plotly.newPlot('plot', data.data, data.layout);
            loadHistory(); // 刷新历史记录
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('发生错误，请检查控制台获取详细信息。');
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
            loadHistory(); // 刷新历史记录
        }
    })
    .catch(error => console.error('Error deleting formula:', error));
}

// 页面加载时加载历史记录
document.addEventListener('DOMContentLoaded', loadHistory);

// 为公式输入框添加回车键监听
document.getElementById('formula').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        plotFormula();
    }
});