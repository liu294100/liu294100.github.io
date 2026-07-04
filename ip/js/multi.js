// ========== Multi Exit IP Detection ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startMultiDetection();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

const allSources = [
    { name: 'ip-api.com', type: 'INT', fetch: () => fetch('http://ip-api.com/json/?lang=zh-CN').then(r => r.json()).then(d => ({ ip: d.query, loc: [d.country, d.regionName, d.city, d.isp].filter(Boolean).join(' '), org: d.org || d.as || '' })) },
    { name: 'ipinfo.io', type: 'INT', fetch: () => fetch('https://ipinfo.io/json').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.region, d.city].filter(Boolean).join(' '), org: d.org || '' })) },
    { name: 'ipwho.is', type: 'INT', fetch: () => fetch('https://ipwho.is/').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.region, d.city].filter(Boolean).join(' '), org: d.connection?.isp || '' })) },
    { name: 'ipapi.co', type: 'INT', fetch: () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country_name, d.region, d.city].filter(Boolean).join(' '), org: d.org || '' })) },
    { name: 'ip.sb', type: 'INT', fetch: () => fetch('https://api.ip.sb/geoip').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.region, d.city].filter(Boolean).join(' '), org: d.organization || '' })) },
    { name: 'speedtest.cn', type: 'CN', fetch: () => fetch('https://api-v3.speedtest.cn/ip').then(r => r.json()).then(d => ({ ip: d.data?.ip, loc: [d.data?.country, d.data?.province, d.data?.city, d.data?.isp].filter(Boolean).join(' '), org: d.data?.isp || '' })) },
    { name: 'useragentinfo', type: 'CN', fetch: () => fetch('https://ip.useragentinfo.com/json').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.province, d.city].filter(Boolean).join(' '), org: d.isp || '' })) },
    { name: 'myip.ipip.net', type: 'CN', fetch: () => fetch('https://myip.ipip.net/').then(r => r.text()).then(t => { const m = t.match(/([\d.]+)/); const l = t.match(/来自于：([^\n<]+)/); return { ip: m?.[1], loc: l?.[1]?.trim() || '', org: '' }; }) },
    { name: 'Cloudflare Trace', type: 'INT', fetch: () => fetch('https://www.cloudflare.com/cdn-cgi/trace').then(r => r.text()).then(t => { const ip = t.match(/ip=(.+)/); const loc = t.match(/loc=(\w+)/); return { ip: ip?.[1], loc: loc?.[1] || '', org: 'Cloudflare' }; }) },
    { name: 'ifconfig.me', type: 'INT', fetch: () => fetch('https://ifconfig.me/all.json').then(r => r.json()).then(d => ({ ip: d.ip_addr, loc: '', org: '' })) },
];

let results = [];

function startMultiDetection() {
    results = [];
    const grid = document.getElementById('multi-grid');
    const summary = document.getElementById('multi-summary');
    const comparison = document.getElementById('ip-comparison');

    grid.innerHTML = allSources.map((s, i) => `
        <div class="multi-card" id="multi-${i}">
            <div class="source-name">${s.name} <span class="badge ${s.type === 'CN' ? 'badge-blue' : 'badge-green'}">${s.type}</span></div>
            <div class="source-ip"><span class="loading-dot"></span></div>
            <div class="source-loc"></div>
        </div>
    `).join('');

    summary.className = 'split-verdict';
    summary.innerHTML = '<span class="loading-dot"></span> 正在检测多出口状态...';
    comparison.innerHTML = '<div class="split-item"><span class="label">等待检测完成...</span></div>';

    allSources.forEach((source, i) => {
        source.fetch()
            .then(result => {
                results.push({ name: source.name, type: source.type, ...result });
                updateCard(i, result);
                checkAllDone();
            })
            .catch(() => {
                results.push({ name: source.name, type: source.type, ip: null, loc: '获取失败', org: '' });
                updateCard(i, { ip: '获取失败', loc: '-', org: '' }, true);
                checkAllDone();
            });
    });
}

function updateCard(index, result, isError) {
    const card = document.getElementById(`multi-${index}`);
    if (!card) return;
    const ipEl = card.querySelector('.source-ip');
    const locEl = card.querySelector('.source-loc');

    ipEl.textContent = result.ip || '获取失败';
    if (isError) ipEl.style.color = 'var(--danger)';
    locEl.textContent = [result.loc, result.org].filter(Boolean).join(' | ');
}

function checkAllDone() {
    if (results.length < allSources.length) return;

    const summary = document.getElementById('multi-summary');
    const comparison = document.getElementById('ip-comparison');

    const validResults = results.filter(r => r.ip && r.ip !== '获取失败');
    const uniqueIPs = [...new Set(validResults.map(r => r.ip))];

    if (uniqueIPs.length === 0) {
        summary.className = 'split-verdict inactive';
        summary.textContent = '❌ 未能获取任何有效 IP';
        return;
    }

    if (uniqueIPs.length === 1) {
        summary.className = 'split-verdict active';
        summary.innerHTML = `✅ 所有出口一致<br><small style="font-weight:400;font-size:13px;">统一出口 IP: ${uniqueIPs[0]}</small>`;
    } else {
        summary.className = 'split-verdict partial';
        summary.innerHTML = `⚠️ 检测到 ${uniqueIPs.length} 个不同出口 IP<br><small style="font-weight:400;font-size:13px;">可能存在分流、多出口或负载均衡</small>`;
    }

    // Build comparison
    let html = '';
    uniqueIPs.forEach(ip => {
        const sources = validResults.filter(r => r.ip === ip);
        const sourceNames = sources.map(s => s.name).join(', ');
        html += `<div class="split-item" style="flex-wrap:wrap;gap:4px;">
            <span class="value" style="font-size:14px;color:var(--primary);">${ip}</span>
            <span class="label" style="width:auto;font-size:12px;">(${sources.length}个源: ${sourceNames})</span>
        </div>`;
    });

    comparison.innerHTML = html;
}
