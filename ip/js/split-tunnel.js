// ========== Split Tunnel Detection ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startDetection();
    initRuleTests();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

// Domestic API sources (should return real IP if direct)
const domesticSources = [
    { name: 'speedtest.cn', fetch: () => fetch('https://api-v3.speedtest.cn/ip').then(r => r.json()).then(d => ({ ip: d.data?.ip, loc: [d.data?.country, d.data?.province, d.data?.city].filter(Boolean).join(' ') })) },
    { name: 'useragentinfo', fetch: () => fetch('https://ip.useragentinfo.com/json').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.province, d.city].filter(Boolean).join(' ') })) },
    { name: 'myip.ipip.net', fetch: () => fetch('https://myip.ipip.net/').then(r => r.text()).then(t => { const m = t.match(/([\d.]+)/); const l = t.match(/来自于：([^\n<]+)/); return { ip: m?.[1], loc: l?.[1]?.trim() || '' }; }) },
];

// Foreign API sources (should return proxy IP if tunneled)
const foreignSources = [
    { name: 'ip-api.com', fetch: () => fetch('http://ip-api.com/json/?lang=zh-CN').then(r => r.json()).then(d => ({ ip: d.query, loc: [d.country, d.regionName, d.city].filter(Boolean).join(' ') })) },
    { name: 'ipinfo.io', fetch: () => fetch('https://ipinfo.io/json').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.region, d.city].filter(Boolean).join(' ') })) },
    { name: 'ipwho.is', fetch: () => fetch('https://ipwho.is/').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country, d.region, d.city].filter(Boolean).join(' ') })) },
    { name: 'ipapi.co', fetch: () => fetch('https://ipapi.co/json/').then(r => r.json()).then(d => ({ ip: d.ip, loc: [d.country_name, d.region, d.city].filter(Boolean).join(' ') })) },
];

let domesticResults = [];
let foreignResults = [];

function startDetection() {
    domesticResults = [];
    foreignResults = [];

    const domesticList = document.getElementById('domestic-list');
    const foreignList = document.getElementById('foreign-list');
    const verdict = document.getElementById('verdict');

    domesticList.innerHTML = domesticSources.map(s => `<div class="split-item"><span class="label">${s.name}</span><span class="value"><span class="loading-dot"></span></span></div>`).join('');
    foreignList.innerHTML = foreignSources.map(s => `<div class="split-item"><span class="label">${s.name}</span><span class="value"><span class="loading-dot"></span></span></div>`).join('');
    verdict.className = 'split-verdict';
    verdict.innerHTML = '<span class="loading-dot"></span> 正在检测分流状态...';

    // Fetch domestic
    domesticSources.forEach((source, i) => {
        source.fetch()
            .then(result => {
                domesticResults.push(result);
                updateList(domesticList, i, result);
                checkCompletion();
            })
            .catch(() => {
                domesticResults.push({ ip: null, loc: '获取失败' });
                updateList(domesticList, i, { ip: '获取失败', loc: '-' }, true);
                checkCompletion();
            });
    });

    // Fetch foreign
    foreignSources.forEach((source, i) => {
        source.fetch()
            .then(result => {
                foreignResults.push(result);
                updateList(foreignList, i, result);
                checkCompletion();
            })
            .catch(() => {
                foreignResults.push({ ip: null, loc: '获取失败' });
                updateList(foreignList, i, { ip: '获取失败', loc: '-' }, true);
                checkCompletion();
            });
    });
}

function updateList(container, index, result, isError) {
    const items = container.querySelectorAll('.split-item');
    if (items[index]) {
        const valueEl = items[index].querySelector('.value');
        valueEl.textContent = result.ip || '获取失败';
        if (isError) valueEl.style.color = 'var(--danger)';
        if (result.loc) {
            valueEl.textContent += ` (${result.loc})`;
        }
    }
}

function checkCompletion() {
    const total = domesticSources.length + foreignSources.length;
    const done = domesticResults.length + foreignResults.length;

    if (done < total) return;

    analyzeResults();
}

function analyzeResults() {
    const verdict = document.getElementById('verdict');

    const validDomestic = domesticResults.filter(r => r.ip && r.ip !== '获取失败').map(r => r.ip);
    const validForeign = foreignResults.filter(r => r.ip && r.ip !== '获取失败').map(r => r.ip);

    const uniqueDomestic = [...new Set(validDomestic)];
    const uniqueForeign = [...new Set(validForeign)];

    if (uniqueDomestic.length === 0 && uniqueForeign.length === 0) {
        verdict.className = 'split-verdict inactive';
        verdict.textContent = '❌ 检测失败：无法获取任何 IP 数据';
        return;
    }

    if (uniqueDomestic.length === 0) {
        verdict.className = 'split-verdict partial';
        verdict.textContent = '⚠️ Only INT APIs reachable, possibly using global proxy';
        return;
    }

    if (uniqueForeign.length === 0) {
        verdict.className = 'split-verdict partial';
        verdict.textContent = '⚠️ Only CN APIs reachable, INT sites unreachable';
        return;
    }

    // Check if domestic and foreign IPs are different
    const hasOverlap = uniqueDomestic.some(ip => uniqueForeign.includes(ip));

    if (!hasOverlap) {
        verdict.className = 'split-verdict active';
        verdict.innerHTML = `✅ Split tunnel active<br><small style="font-weight:400;font-size:13px;">CN direct: ${uniqueDomestic[0]} | INT proxy: ${uniqueForeign[0]}</small>`;
    } else if (uniqueDomestic.length === 1 && uniqueForeign.length === 1 && uniqueDomestic[0] === uniqueForeign[0]) {
        verdict.className = 'split-verdict inactive';
        verdict.innerHTML = `❌ No split detected<br><small style="font-weight:400;font-size:13px;">CN & INT using same IP: ${uniqueDomestic[0]}</small>`;
    } else {
        verdict.className = 'split-verdict partial';
        verdict.innerHTML = `⚠️ 部分分流<br><small style="font-weight:400;font-size:13px;">检测到${uniqueDomestic.length + uniqueForeign.length}个不同出口，规则可能不完整</small>`;
    }
}

// ========== Rule Tests ==========
function initRuleTests() {
    const rules = [
        { domain: 'www.baidu.com', expect: 'Direct', type: 'CN' },
        { domain: 'www.taobao.com', expect: 'Direct', type: 'CN' },
        { domain: 'www.bilibili.com', expect: 'Direct', type: 'CN' },
        { domain: 'www.google.com', expect: 'Proxy', type: 'INT' },
        { domain: 'www.youtube.com', expect: 'Proxy', type: 'INT' },
        { domain: 'www.twitter.com', expect: 'Proxy', type: 'INT' },
        { domain: 'chat.openai.com', expect: 'Proxy', type: 'INT' },
        { domain: 'github.com', expect: '代理/直连', type: '视规则' },
    ];

    const grid = document.getElementById('rule-test-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px;';

    rules.forEach((rule, i) => {
        const card = document.createElement('div');
        card.className = 'conn-card';
        card.innerHTML = `
            <div class="conn-name">${rule.domain}</div>
            <div class="conn-type">预期: ${rule.expect} (${rule.type})</div>
            <div class="conn-status"><span class="loading-dot"></span></div>
        `;
        grid.appendChild(card);

        const start = performance.now();
        const img = new Image();
        const statusEl = card.querySelector('.conn-status');

        const timeout = setTimeout(() => {
            img.src = '';
            statusEl.textContent = '超时/不可达';
            statusEl.style.color = 'var(--danger)';
        }, 6000);

        img.onload = () => {
            clearTimeout(timeout);
            const t = Math.round(performance.now() - start);
            statusEl.textContent = `可达 ${t}ms`;
            statusEl.style.color = 'var(--success)';
        };

        img.onerror = () => {
            clearTimeout(timeout);
            fetch(`https://${rule.domain}/favicon.ico`, { mode: 'no-cors', cache: 'no-store' })
                .then(() => {
                    const t = Math.round(performance.now() - start);
                    statusEl.textContent = `可达 ${t}ms`;
                    statusEl.style.color = 'var(--success)';
                })
                .catch(() => {
                    statusEl.textContent = '不可达';
                    statusEl.style.color = 'var(--danger)';
                });
        };

        img.src = `https://${rule.domain}/favicon.ico?t=${Date.now()}`;
    });
}
