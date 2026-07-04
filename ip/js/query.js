// ========== IP Query Tool ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    // Auto-detect current IP on load
    fetchCurrentIP();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

function fetchCurrentIP() {
    fetch('http://ip-api.com/json/?lang=zh-CN')
        .then(r => r.json())
        .then(data => {
            if (data && data.query) {
                document.getElementById('query-input').placeholder = `当前 IP: ${data.query} (输入其他 IP 查询)`;
            }
        })
        .catch(() => {});
}

function queryIP() {
    const input = document.getElementById('query-input');
    const btn = document.getElementById('query-btn');
    const resultContainer = document.getElementById('query-result-container');

    let ip = input.value.trim();

    // If empty, query self
    if (!ip) {
        ip = ''; // Will use default (self) for APIs
    }

    // Validate IP format if provided
    if (ip && !isValidIP(ip) && !isValidDomain(ip)) {
        resultContainer.innerHTML = '<div class="info-box" style="background:#fee2e2;border-color:#fca5a5;color:#b91c1c;">请输入有效的 IP 地址或域名</div>';
        return;
    }

    btn.disabled = true;
    btn.textContent = '查询中...';
    resultContainer.innerHTML = '<p><span class="loading-dot"></span> 正在查询多个数据源...</p>';

    const queries = [
        queryIPAPI(ip),
        queryIPInfo(ip),
        queryIPAPICo(ip),
        queryIPWho(ip),
    ];

    Promise.allSettled(queries).then(results => {
        btn.disabled = false;
        btn.textContent = '查询';

        let html = '';
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                html += r.value;
            }
        });

        if (!html) {
            html = '<div class="info-box" style="background:#fee2e2;border-color:#fca5a5;color:#b91c1c;">所有数据源查询失败，请检查 IP 地址是否正确。</div>';
        }

        resultContainer.innerHTML = html;
    });
}

function queryIPAPI(ip) {
    const url = ip ? `http://ip-api.com/json/${ip}?lang=zh-CN&fields=66846719` : 'http://ip-api.com/json/?lang=zh-CN&fields=66846719';
    return fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data.status === 'fail') return null;
            return buildResultCard('ip-api.com', [
                ['IP', data.query],
                ['国家', `${data.country} (${data.countryCode})`],
                ['地区', data.regionName],
                ['城市', data.city],
                ['邮编', data.zip],
                ['经纬度', `${data.lat}, ${data.lon}`],
                ['时区', data.timezone],
                ['ISP', data.isp],
                ['组织', data.org],
                ['AS', data.as],
                ['是否代理', data.proxy ? '是' : '否'],
                ['是否移动网络', data.mobile ? '是' : '否'],
                ['是否托管', data.hosting ? '是' : '否'],
            ]);
        })
        .catch(() => null);
}

function queryIPInfo(ip) {
    const url = ip ? `https://ipinfo.io/${ip}/json` : 'https://ipinfo.io/json';
    return fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data.error) return null;
            return buildResultCard('ipinfo.io', [
                ['IP', data.ip],
                ['主机名', data.hostname || '-'],
                ['国家', data.country],
                ['地区', data.region],
                ['城市', data.city],
                ['位置', data.loc],
                ['组织', data.org],
                ['邮编', data.postal],
                ['时区', data.timezone],
            ]);
        })
        .catch(() => null);
}

function queryIPAPICo(ip) {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    return fetch(url)
        .then(r => r.json())
        .then(data => {
            if (data.error) return null;
            return buildResultCard('ipapi.co', [
                ['IP', data.ip],
                ['版本', data.version],
                ['国家', `${data.country_name} (${data.country_code})`],
                ['地区', data.region],
                ['城市', data.city],
                ['邮编', data.postal],
                ['经纬度', `${data.latitude}, ${data.longitude}`],
                ['时区', data.timezone],
                ['UTC 偏移', data.utc_offset],
                ['ISP', data.org],
                ['ASN', data.asn],
                ['网络', data.network],
            ]);
        })
        .catch(() => null);
}

function queryIPWho(ip) {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    return fetch(url)
        .then(r => r.json())
        .then(data => {
            if (!data.success && data.success !== undefined) return null;
            return buildResultCard('ipwho.is', [
                ['IP', data.ip],
                ['类型', data.type],
                ['大洲', data.continent],
                ['国家', `${data.country} (${data.country_code})`],
                ['地区', data.region],
                ['城市', data.city],
                ['经纬度', `${data.latitude}, ${data.longitude}`],
                ['邮编', data.postal],
                ['ISP', data.connection?.isp],
                ['组织', data.connection?.org],
                ['ASN', `AS${data.connection?.asn}`],
                ['域名', data.connection?.domain],
                ['是否 VPN', data.security?.vpn ? '是' : '否'],
                ['是否代理', data.security?.proxy ? '是' : '否'],
                ['是否 Tor', data.security?.tor ? '是' : '否'],
            ]);
        })
        .catch(() => null);
}

function buildResultCard(source, rows) {
    let html = `<div class="query-result" style="margin-bottom:16px;">
        <div class="query-result-header">${source}</div>
        <div class="query-result-body">`;

    rows.forEach(([label, value]) => {
        if (value && value !== 'undefined' && value !== 'null') {
            html += `<div class="query-row">
                <span class="q-label">${label}</span>
                <span class="q-value">${value}</span>
            </div>`;
        }
    });

    html += '</div></div>';
    return html;
}

function isValidIP(str) {
    // IPv4
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4.test(str)) {
        return str.split('.').every(n => parseInt(n) <= 255);
    }
    // IPv6 simplified check
    if (str.includes(':')) return true;
    return false;
}

function isValidDomain(str) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(str);
}

// Handle Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'query-input') {
        queryIP();
    }
});
