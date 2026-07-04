// ========== DNS Exit Lookup ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startDNSLookup();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

// DNS detection methods
const dnsTests = [
    {
        name: 'ip-api.com EDNS',
        type: 'EDNS Client Subnet',
        fetch: () => {
            const rand = Math.random().toString(36).substring(2, 12);
            return fetch(`https://${rand}sukkawww.edns.ip-api.com/json?lang=zh-CN`)
                .then(r => r.json())
                .then(d => ({
                    ip: d.dns?.ip || '未检测到',
                    loc: d.dns?.geo || '未知'
                }));
        }
    },
    {
        name: 'Surfshark DNS #1',
        type: 'DNS Leak Test',
        fetch: () => {
            return fetch('https://zsctrp65me.ipv4.surfsharkdns.com/')
                .then(r => r.json())
                .then(data => {
                    const entries = Object.entries(data);
                    if (entries.length > 0) {
                        const [ip, info] = entries[0];
                        return { ip, loc: `${info.Country || ''} ${info.City || ''} (${info.ISP || ''})`.trim() };
                    }
                    return { ip: '未检测到', loc: '未知' };
                });
        }
    },
    {
        name: 'Surfshark DNS #2',
        type: 'DNS Leak Test',
        fetch: () => {
            return fetch('https://ojd00lvce8f.ipv4.surfsharkdns.com/')
                .then(r => r.json())
                .then(data => {
                    const entries = Object.entries(data);
                    if (entries.length > 0) {
                        const [ip, info] = entries[0];
                        return { ip, loc: `${info.Country || ''} ${info.City || ''} (${info.ISP || ''})`.trim() };
                    }
                    return { ip: '未检测到', loc: '未知' };
                });
        }
    },
    {
        name: 'Google DNS (DoH)',
        type: 'DoH 解析',
        fetch: () => {
            return fetch('https://dns.google/resolve?name=o-o.myaddr.l.google.com&type=TXT')
                .then(r => r.json())
                .then(data => {
                    if (data.Answer && data.Answer.length > 0) {
                        const ip = data.Answer[0].data?.replace(/"/g, '') || '未检测到';
                        return { ip, loc: 'Google DNS 出口' };
                    }
                    return { ip: '未检测到', loc: '未知' };
                });
        }
    },
    {
        name: 'Cloudflare DNS (DoH)',
        type: 'DoH 解析',
        fetch: () => {
            return fetch('https://cloudflare-dns.com/dns-query?name=o-o.myaddr.l.google.com&type=TXT', {
                headers: { 'Accept': 'application/dns-json' }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.Answer && data.Answer.length > 0) {
                        const ip = data.Answer[0].data?.replace(/"/g, '') || '未检测到';
                        return { ip, loc: 'Cloudflare DNS 出口' };
                    }
                    return { ip: '未检测到', loc: '未知' };
                });
        }
    },
    {
        name: 'AliDNS (DoH)',
        type: 'DoH 解析',
        fetch: () => {
            return fetch('https://dns.alidns.com/resolve?name=o-o.myaddr.l.google.com&type=TXT')
                .then(r => r.json())
                .then(data => {
                    if (data.Answer && data.Answer.length > 0) {
                        const ip = data.Answer[0].data?.replace(/"/g, '') || '未检测到';
                        return { ip, loc: '阿里 DNS 出口' };
                    }
                    return { ip: '未检测到', loc: '未知' };
                });
        }
    },
];

function startDNSLookup() {
    const tbody = document.getElementById('dns-tbody');
    tbody.innerHTML = dnsTests.map((test, i) => `
        <tr id="dns-row-${i}">
            <td>${test.name}</td>
            <td><span class="badge badge-purple">${test.type}</span></td>
            <td class="ip-cell"><span class="loading-dot"></span></td>
            <td><span class="loading-dot"></span></td>
        </tr>
    `).join('');

    dnsTests.forEach((test, i) => {
        test.fetch()
            .then(result => updateDNSRow(i, result))
            .catch(() => updateDNSRow(i, { ip: '获取失败', loc: '-' }, true));
    });
}

function updateDNSRow(index, result, isError) {
    const row = document.getElementById(`dns-row-${index}`);
    if (!row) return;
    const cells = row.querySelectorAll('td');
    cells[2].textContent = result.ip || '获取失败';
    cells[2].style.fontFamily = 'var(--mono)';
    cells[2].style.fontWeight = '600';
    if (isError) cells[2].style.color = 'var(--danger)';
    else cells[2].style.color = 'var(--success)';

    cells[3].textContent = result.loc || '-';
}

// ========== DNS Resolution Test ==========
function resolveDomain() {
    const domain = document.getElementById('dns-domain-input').value.trim();
    const resultDiv = document.getElementById('dns-resolve-result');

    if (!domain) {
        resultDiv.innerHTML = '<p style="color:var(--danger);margin-top:12px;">请输入域名</p>';
        return;
    }

    resultDiv.innerHTML = '<p style="margin-top:12px;"><span class="loading-dot"></span> 正在解析...</p>';

    const resolvers = [
        { name: 'Google DNS', url: `https://dns.google/resolve?name=${domain}&type=A` },
        { name: 'Cloudflare DNS', url: `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, headers: { 'Accept': 'application/dns-json' } },
        { name: 'AliDNS', url: `https://dns.alidns.com/resolve?name=${domain}&type=A` },
    ];

    let html = `<div style="margin-top:16px;">`;

    Promise.allSettled(resolvers.map(resolver =>
        fetch(resolver.url, resolver.headers ? { headers: resolver.headers } : {})
            .then(r => r.json())
            .then(data => {
                const answers = (data.Answer || []).filter(a => a.type === 1).map(a => a.data);
                return { name: resolver.name, ips: answers.length > 0 ? answers : ['无记录'] };
            })
            .catch(() => ({ name: resolver.name, ips: ['查询失败'] }))
    )).then(results => {
        results.forEach(r => {
            const result = r.value;
            html += `<div class="stun-card" style="margin-bottom:12px;">
                <h3>${result.name}</h3>
                <div class="stun-value">${result.ips.join(', ')}</div>
                <div class="stun-detail">域名: ${domain}</div>
            </div>`;
        });
        html += '</div>';
        resultDiv.innerHTML = html;
    });
}
