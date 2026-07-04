// ========== IP Quality & Risk Detection ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startRiskCheck();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

let currentIP = null;
let ipDetails = null;

function startRiskCheck() {
    document.getElementById('exit-ip-info').innerHTML = '<div style="text-align:center;padding:20px;"><span class="loading-dot"></span> 获取出口 IP...</div>';
    document.getElementById('risk-factors').innerHTML = '<div style="text-align:center;padding:20px;"><span class="loading-dot"></span> 分析中...</div>';

    getExitIPInfo().then(() => {
        analyzeRiskFactors();
    });
}

function getExitIPInfo() {
    return fetch('http://ip-api.com/json/?lang=zh-CN&fields=66846719')
        .then(r => r.json())
        .then(data => {
            currentIP = data.query;
            ipDetails = data;
            renderExitIP(data);
        })
        .catch(() => {
            return fetch('https://ipwho.is/')
                .then(r => r.json())
                .then(data => {
                    currentIP = data.ip;
                    ipDetails = {
                        query: data.ip,
                        country: data.country,
                        countryCode: data.country_code,
                        regionName: data.region,
                        city: data.city,
                        isp: data.connection?.isp,
                        org: data.connection?.org,
                        as: data.connection?.asn ? `AS${data.connection.asn}` : '',
                        proxy: data.security?.proxy,
                        hosting: false,
                        mobile: false
                    };
                    renderExitIP(ipDetails);
                });
        });
}

function renderExitIP(data) {
    const el = document.getElementById('exit-ip-info');

    // Calculate quick risk score
    let riskScore = 0;
    if (data.proxy) riskScore += 30;
    if (data.hosting) riskScore += 25;

    const ispLower = ((data.isp || '') + ' ' + (data.org || '')).toLowerCase();
    const vpnProviders = ['nordvpn', 'expressvpn', 'surfshark', 'mullvad', 'protonvpn', 'digital ocean', 'vultr', 'linode', 'hetzner', 'ovh', 'choopa', 'quadranet', 'cogent', 'psychz'];
    if (vpnProviders.some(p => ispLower.includes(p))) riskScore += 20;

    riskScore = Math.min(100, Math.max(0, riskScore));
    const riskLabel = riskScore >= 60 ? '高风险' : riskScore >= 30 ? '中风险' : '低风险';
    const riskColor = riskScore >= 60 ? 'var(--danger)' : riskScore >= 30 ? 'var(--warning)' : 'var(--success)';

    el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px;">
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>IP 地址</h3>
                <div class="stun-value" style="color:var(--accent);font-size:15px;">${data.query}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>地理位置</h3>
                <div class="stun-value" style="font-size:13px;">${[data.country, data.regionName, data.city].filter(Boolean).join(' ')}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>ISP</h3>
                <div class="stun-value" style="font-size:12px;">${data.isp || data.org || '-'}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>ASN</h3>
                <div class="stun-value" style="font-size:12px;">${data.as || '-'}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>代理/VPN</h3>
                <div class="stun-value" style="font-size:14px;color:${data.proxy ? 'var(--danger)' : 'var(--success)'};">${data.proxy ? '✗ 是' : '✓ 否'}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>数据中心</h3>
                <div class="stun-value" style="font-size:14px;color:${data.hosting ? 'var(--warning)' : 'var(--success)'};">${data.hosting ? '✗ 是' : '✓ 否'}</div>
            </div>
            <div class="stun-card" style="padding:16px;text-align:center;">
                <h3>综合风险</h3>
                <div class="stun-value" style="font-size:16px;color:${riskColor};">${riskLabel}</div>
                <div class="stun-detail">${riskScore}/100</div>
            </div>
        </div>

        <!-- Risk bar -->
        <div style="margin-bottom:4px;display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);">
            <span>低风险</span><span>高风险</span>
        </div>
        <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${riskScore}%;background:linear-gradient(90deg,var(--success),var(--warning),var(--danger));border-radius:4px;transition:width 0.6s;"></div>
        </div>
    `;
}

function analyzeRiskFactors() {
    const el = document.getElementById('risk-factors');

    if (!ipDetails) {
        setTimeout(analyzeRiskFactors, 1000);
        return;
    }

    const factors = [];

    // Proxy
    if (ipDetails.proxy) {
        factors.push({ icon: '⚠️', text: '该 IP 被标记为代理/VPN 出口', level: 'high' });
    } else {
        factors.push({ icon: '✅', text: '未被标记为代理/VPN', level: 'low' });
    }

    // Hosting
    if (ipDetails.hosting) {
        factors.push({ icon: '⚠️', text: '数据中心 IP（非住宅网络）', level: 'high' });
    } else {
        factors.push({ icon: '✅', text: '住宅网络 IP', level: 'low' });
    }

    // Mobile
    if (ipDetails.mobile) {
        factors.push({ icon: '✅', text: '移动网络（通常风险更低）', level: 'low' });
    }

    // ISP check
    const ispLower = ((ipDetails.isp || '') + ' ' + (ipDetails.org || '')).toLowerCase();
    const vpnProviders = ['nordvpn', 'expressvpn', 'surfshark', 'mullvad', 'protonvpn', 'digital ocean', 'vultr', 'linode', 'hetzner', 'ovh', 'choopa'];
    const isKnownVPN = vpnProviders.some(p => ispLower.includes(p));
    if (isKnownVPN) {
        factors.push({ icon: '⚠️', text: 'ISP 为已知 VPN/托管服务商', level: 'high' });
    } else {
        factors.push({ icon: '✅', text: 'ISP 非已知 VPN 服务商', level: 'low' });
    }

    // Country
    const code = ipDetails.countryCode || '';
    if (['US', 'GB', 'DE', 'JP', 'SG', 'KR'].includes(code)) {
        factors.push({ icon: '✅', text: `IP 所在地区 (${code}) 受 AI 服务支持`, level: 'low' });
    } else if (['CN', 'RU', 'IR'].includes(code)) {
        factors.push({ icon: '⚠️', text: `IP 所在地区 (${code}) 部分 AI 服务不直接支持`, level: 'high' });
    }

    let html = `<div style="margin-bottom:16px;">`;
    factors.forEach(f => {
        const color = f.level === 'high' ? 'var(--danger)' : f.level === 'medium' ? 'var(--warning)' : 'var(--success)';
        html += `<div style="padding:10px 0;border-bottom:1px solid rgba(148,163,184,0.06);display:flex;align-items:center;gap:10px;font-size:14px;">
            <span style="font-size:16px;">${f.icon}</span>
            <span>${f.text}</span>
        </div>`;
    });
    html += `</div>`;

    html += `
        <div style="padding:16px;background:var(--glass);border:1px solid var(--border);border-radius:10px;">
            <div style="font-size:14px;font-weight:600;margin-bottom:10px;">💡 降低 IP 风险建议</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.9;">
                • 使用住宅代理 IP 代替数据中心 IP<br>
                • 选择 AI 服务支持地区（美国、日本、新加坡等）的 IP<br>
                • 避免使用被大量用户共享的代理节点<br>
                • 保持 IP 地理位置与账号注册地一致<br>
                • 避免短时间内频繁更换出口 IP
            </div>
        </div>
    `;

    el.innerHTML = html;
}
