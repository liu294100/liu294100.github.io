// ========== Split Tunnel Test ==========
// Principle: Use different IP-detection endpoints on various domains.
// Clash routes traffic per-domain, so different endpoints reveal different exit IPs.
//
// For Cloudflare-hosted sites: /cdn-cgi/trace (returns ip=xxx)
// For others: use dedicated IP-echo APIs that return requester's IP

document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startSplitTest();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

// ========== Test Site Definitions ==========
// Each site uses a specific detection method that works for that domain's routing
const testSites = [
    // --- Domestic (direct) ---
    {
        name: 'speedtest.cn',
        tag: 'CN',
        icon: 'https://www.speedtest.cn/favicon.ico',
        detect: () => fetch('https://api-v3.speedtest.cn/ip').then(r => r.json()).then(d => d.data?.ip)
    },
    {
        name: 'ip.useragentinfo',
        tag: 'CN',
        icon: 'https://ip.useragentinfo.com/favicon.ico',
        detect: () => fetch('https://ip.useragentinfo.com/ip').then(r => r.text()).then(t => t.trim())
    },
    {
        name: 'myip.ipip.net',
        tag: 'CN',
        icon: 'https://www.ipip.net/favicon.ico',
        detect: () => fetch('https://myip.ipip.net/').then(r => r.text()).then(t => { const m = t.match(/([\d.]+)/); return m ? m[1] : null; })
    },
    {
        name: 'httpbin.org',
        tag: 'CN',
        icon: 'https://httpbin.org/favicon.ico',
        detect: () => fetch('https://httpbin.org/ip').then(r => r.json()).then(d => d.origin?.split(',')[0]?.trim())
    },
    {
        name: 'identme',
        tag: 'CN',
        icon: '',
        detect: () => fetch('https://ident.me/').then(r => r.text()).then(t => t.trim())
    },

    // --- International (proxy) ---
    {
        name: 'Cloudflare (1.0.0.1)',
        tag: 'INT',
        icon: 'https://www.cloudflare.com/favicon.ico',
        detect: () => cfTrace('1.0.0.1')
    },
    {
        name: 'Cloudflare (workers.dev)',
        tag: 'INT',
        icon: 'https://www.cloudflare.com/favicon.ico',
        detect: () => cfTrace('cloudflare.com')
    },
    {
        name: 'chatgpt.com',
        tag: 'INT',
        tagExtra: 'AI',
        icon: 'https://chatgpt.com/favicon.ico',
        detect: () => cfTrace('chatgpt.com')
    },
    {
        name: 'claude.ai',
        tag: 'INT',
        tagExtra: 'AI',
        icon: 'https://claude.ai/favicon.ico',
        detect: () => cfTrace('claude.ai')
    },
    {
        name: 'discord.com',
        tag: 'INT',
        icon: 'https://discord.com/favicon.ico',
        detect: () => cfTrace('discord.com')
    },
    {
        name: 'x.com (Twitter)',
        tag: 'INT',
        icon: 'https://x.com/favicon.ico',
        detect: () => cfTrace('x.com')
    },
    {
        name: 'visa.com',
        tag: 'INT',
        icon: 'https://www.visa.com/favicon.ico',
        detect: () => cfTrace('www.visa.com')
    },
    {
        name: 'medium.com',
        tag: 'INT',
        icon: 'https://medium.com/favicon.ico',
        detect: () => cfTrace('medium.com')
    },
    {
        name: 'ip-api.com',
        tag: 'INT',
        icon: '',
        detect: () => fetch('http://ip-api.com/json/?fields=query').then(r => r.json()).then(d => d.query)
    },
    {
        name: 'ipinfo.io',
        tag: 'INT',
        icon: 'https://ipinfo.io/favicon.ico',
        detect: () => fetch('https://ipinfo.io/ip').then(r => r.text()).then(t => t.trim())
    },
    {
        name: 'ifconfig.me',
        tag: 'INT',
        icon: '',
        detect: () => fetch('https://ifconfig.me/ip').then(r => r.text()).then(t => t.trim())
    },
    {
        name: 'icanhazip.com',
        tag: 'INT',
        icon: '',
        detect: () => fetch('https://icanhazip.com/').then(r => r.text()).then(t => t.trim())
    },
    {
        name: 'api.ip.sb',
        tag: 'INT',
        icon: '',
        detect: () => fetch('https://api.ip.sb/ip').then(r => r.text()).then(t => t.trim())
    },
];

let activeSites = [...testSites];

// ========== Cloudflare Trace ==========
function cfTrace(domain) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    return fetch(`https://${domain}/cdn-cgi/trace`, {
        signal: controller.signal,
        cache: 'no-store'
    })
    .then(r => {
        clearTimeout(timeout);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
    })
    .then(text => {
        const m = text.match(/ip=(.+)/);
        if (m && m[1]) return m[1].trim();
        throw new Error('no ip');
    })
    .catch(err => {
        clearTimeout(timeout);
        throw err;
    });
}

// ========== UI ==========
function startSplitTest() {
    const tbody = document.getElementById('split-tbody');
    tbody.innerHTML = activeSites.map((site, i) => {
        let tagHtml = `<span class="badge ${site.tag === 'CN' ? 'badge-blue' : site.tag === '自定义' ? 'badge-cyan' : 'badge-green'}" style="font-size:10px;">${site.tag}</span>`;
        if (site.tagExtra) tagHtml += ` <span class="badge badge-purple" style="font-size:10px;">${site.tagExtra}</span>`;

        return `<tr id="row-${i}">
            <td>
                <div class="site-cell">
                    ${site.icon ? `<img src="${site.icon}" alt="" onerror="this.style.display='none'">` : ''}
                    <span class="site-name">${site.name}</span>
                    ${tagHtml}
                </div>
            </td>
            <td id="flag-${i}" style="text-align:center;font-size:18px;"><span class="loading-dot"></span></td>
            <td id="ip-${i}" class="ip-mono"><span class="loading-dot"></span></td>
            <td id="geo-${i}" class="geo-text"><span class="loading-dot"></span></td>
        </tr>`;
    }).join('');

    runSequential(0);
}

function runSequential(index) {
    if (index >= activeSites.length) return;

    const site = activeSites[index];
    const flagEl = document.getElementById(`flag-${index}`);
    const ipEl = document.getElementById(`ip-${index}`);
    const geoEl = document.getElementById(`geo-${index}`);

    const wrapDetect = () => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('timeout')), 8000);
            site.detect()
                .then(ip => { clearTimeout(timeout); resolve(ip); })
                .catch(err => { clearTimeout(timeout); reject(err); });
        });
    };

    wrapDetect()
        .then(ip => {
            if (ip) {
                ipEl.textContent = ip;
                lookupGeo(ip, flagEl, geoEl);
            } else {
                throw new Error('empty');
            }
        })
        .catch(() => {
            ipEl.textContent = '检测失败';
            ipEl.style.color = 'var(--danger)';
            flagEl.textContent = '✗';
            flagEl.style.color = 'var(--danger)';
            geoEl.textContent = '接口不可达或被阻断';
        })
        .finally(() => {
            setTimeout(() => runSequential(index + 1), 200);
        });
}

// ========== Geo Lookup ==========
function lookupGeo(ip, flagEl, geoEl) {
    // Skip geo lookup for obvious private/invalid IPs
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        flagEl.textContent = '🏠';
        geoEl.textContent = '本地网络';
        return;
    }

    fetch(`http://ip-api.com/json/${ip}?lang=zh-CN&fields=status,country,countryCode,regionName,city,isp,org`)
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                const cc = (data.countryCode || '').toLowerCase();
                const flags = { cn:'🇨🇳', us:'🇺🇸', jp:'🇯🇵', sg:'🇸🇬', hk:'🇭🇰', gb:'🇬🇧', de:'🇩🇪', kr:'🇰🇷', tw:'🇹🇼', fr:'🇫🇷', au:'🇦🇺', ca:'🇨🇦', nl:'🇳🇱', in:'🇮🇳', ru:'🇷🇺', br:'🇧🇷', ie:'🇮🇪', se:'🇸🇪', ch:'🇨🇭', fi:'🇫🇮', no:'🇳🇴', dk:'🇩🇰', it:'🇮🇹', es:'🇪🇸', my:'🇲🇾', th:'🇹🇭', vn:'🇻🇳', ph:'🇵🇭', id:'🇮�' };
                flagEl.textContent = flags[cc] || cc.toUpperCase();
                geoEl.textContent = [data.country, data.regionName, data.city, data.isp || data.org].filter(Boolean).join(' ');
            } else {
                flagEl.textContent = '?';
                geoEl.textContent = '位置未知';
            }
        })
        .catch(() => {
            flagEl.textContent = '?';
            geoEl.textContent = '查询失败';
        });
}

// ========== Custom Domain Input ==========
function addCustomDomains() {
    const input = document.getElementById('custom-domain');
    const raw = input.value.split(',').map(s => s.trim().replace(/^https?:\/\//, '').split('/')[0]).filter(Boolean);

    if (raw.length === 0) {
        alert('请输入至少一个域名');
        return;
    }

    raw.forEach(domain => {
        if (!activeSites.find(s => s.name === domain)) {
            activeSites.push({
                name: domain,
                tag: '自定义',
                icon: `https://${domain}/favicon.ico`,
                detect: () => cfTrace(domain) // CF trace as first attempt
                    .catch(() =>
                        // Fallback: try fetching the domain and use a general IP API
                        fetch(`https://${domain}/cdn-cgi/trace`, { mode: 'cors', cache: 'no-store' })
                            .then(r => r.text())
                            .then(t => { const m = t.match(/ip=(.+)/); return m?.[1]?.trim(); })
                    )
            });
        }
    });

    startSplitTest();
    input.value = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'custom-domain') {
        addCustomDomains();
    }
});
