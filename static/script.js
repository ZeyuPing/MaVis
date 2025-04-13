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
            alert('Error loading history');
        });
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
        alert('Please enter a formula');
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
            alert('Error: ' + data);
        } else {
            Plotly.newPlot('plot', data.data, data.layout);
            loadHistory(); // 刷新历史记录
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error generating graph. Please check your formula.');
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
        } else {
            alert('Error deleting formula');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting formula');
    });
}

// 页面加载时加载历史记录
document.addEventListener('DOMContentLoaded', loadHistory);

// 为公式输入框添加回车键监听
document.getElementById('formula').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        plotFormula();
    }
});