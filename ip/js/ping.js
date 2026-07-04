// ========== Ping / Latency Testing ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

let pingInterval = null;
let pingResults = [];
let pingTotal = 0;
let pingLost = 0;
let chartCtx = null;

function setPingTarget(domain) {
    document.getElementById('ping-input').value = domain;
}

function startPing() {
    const input = document.getElementById('ping-input');
    const domain = input.value.trim();
    if (!domain) {
        alert('请输入域名');
        return;
    }

    // Stop any existing ping
    stopPing();

    // Reset state
    pingResults = [];
    pingTotal = 0;
    pingLost = 0;

    // Show UI elements
    document.getElementById('ping-stats').style.display = 'block';
    document.getElementById('ping-chart-container').style.display = 'block';
    document.getElementById('ping-log').style.display = 'block';
    document.getElementById('ping-log').innerHTML = '';
    document.getElementById('stop-btn').style.display = 'inline-flex';
    document.getElementById('ping-btn').disabled = true;

    // Initialize chart
    initChart();

    // Start pinging
    doPing(domain);
    pingInterval = setInterval(() => doPing(domain), 1500);

    logMessage(`PING ${domain} ...`, 'var(--text-secondary)');
}

function stopPing() {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
    }
    document.getElementById('stop-btn').style.display = 'none';
    document.getElementById('ping-btn').disabled = false;

    if (pingTotal > 0) {
        logMessage(`--- 测试结束: 共 ${pingTotal} 次, 丢包 ${pingLost} 次 (${Math.round(pingLost / pingTotal * 100)}%) ---`, 'var(--text-secondary)');
    }
}

function doPing(domain) {
    pingTotal++;
    const seq = pingTotal;
    const start = performance.now();

    // Use fetch with no-cors for timing
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`https://${domain}/favicon.ico?_=${Date.now()}`, {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
    })
    .then(() => {
        clearTimeout(timeout);
        const latency = Math.round(performance.now() - start);
        pingResults.push(latency);
        updateStats();
        drawChart();
        logMessage(`序号 ${seq}: 来自 ${domain} 的回复  延迟=${latency}ms`, getLatencyColor(latency));
    })
    .catch((e) => {
        clearTimeout(timeout);
        const elapsed = Math.round(performance.now() - start);

        if (e.name === 'AbortError') {
            // Timeout
            pingLost++;
            pingResults.push(-1);
            updateStats();
            drawChart();
            logMessage(`序号 ${seq}: 请求超时 (>5000ms)`, 'var(--danger)');
        } else {
            // Might still be reachable (CORS error is not failure)
            if (elapsed < 4000) {
                pingResults.push(elapsed);
                updateStats();
                drawChart();
                logMessage(`序号 ${seq}: 来自 ${domain} 的回复  延迟=${elapsed}ms (no-cors)`, getLatencyColor(elapsed));
            } else {
                pingLost++;
                pingResults.push(-1);
                updateStats();
                drawChart();
                logMessage(`序号 ${seq}: 请求失败 (${elapsed}ms)`, 'var(--danger)');
            }
        }
    });
}

function getLatencyColor(ms) {
    if (ms < 100) return 'var(--success)';
    if (ms < 300) return 'var(--accent)';
    if (ms < 800) return 'var(--warning)';
    return 'var(--danger)';
}

function updateStats() {
    const valid = pingResults.filter(r => r > 0);
    const min = valid.length > 0 ? Math.min(...valid) : 0;
    const max = valid.length > 0 ? Math.max(...valid) : 0;
    const avg = valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
    const loss = pingTotal > 0 ? Math.round(pingLost / pingTotal * 100) : 0;

    document.getElementById('stat-min').textContent = valid.length > 0 ? `${min}ms` : '-';
    document.getElementById('stat-avg').textContent = valid.length > 0 ? `${avg}ms` : '-';
    document.getElementById('stat-max').textContent = valid.length > 0 ? `${max}ms` : '-';
    document.getElementById('stat-loss').textContent = `${loss}%`;
    document.getElementById('stat-count').textContent = `${pingTotal}`;
}

function logMessage(msg, color) {
    const log = document.getElementById('ping-log');
    const line = document.createElement('div');
    line.style.color = color;
    line.style.padding = '3px 0';
    line.textContent = msg;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
}

// ========== Simple Canvas Chart ==========
function initChart() {
    const canvas = document.getElementById('ping-chart');
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = 200 * (window.devicePixelRatio || 1);
    chartCtx = canvas.getContext('2d');
    chartCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
}

function drawChart() {
    if (!chartCtx) return;

    const canvas = document.getElementById('ping-chart');
    const w = canvas.offsetWidth;
    const h = 200;
    const ctx = chartCtx;

    // Clear
    ctx.clearRect(0, 0, w, h);

    const data = pingResults.slice(-60); // Last 60 results
    if (data.length < 2) return;

    const validData = data.filter(d => d > 0);
    if (validData.length === 0) return;

    const maxVal = Math.max(...validData, 100);
    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    let firstPoint = true;
    data.forEach((val, i) => {
        if (val <= 0) return; // Skip lost packets
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw dots for lost packets
    data.forEach((val, i) => {
        if (val === -1) {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, padding.top + chartH, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw dots on valid points
    data.forEach((val, i) => {
        if (val <= 0) return;
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Y-axis labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal - (maxVal / 4) * i);
        const y = padding.top + (chartH / 4) * i + 3;
        ctx.fillText(`${val}ms`, w - 4, y);
    }
}

// Handle Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'ping-input') {
        startPing();
    }
});
