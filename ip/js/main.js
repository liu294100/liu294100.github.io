// ========== Main Page Logic ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initIPQueries();
    initCDNTests();
    initConnectivityChecks();
    initToggles();
});

// ========== Navigation Toggle ==========
function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('show');
        });
    }
}

// ========== IP Queries ==========
function initIPQueries() {
    // Domestic sources
    fetchIPFromMyipIpip();
    fetchIPFromSpeedtest();
    fetchIPFromUseragent();

    // Foreign sources
    fetchIPFromIPAPI();
    fetchIPFromIPInfo();
    fetchIPFromIPSB();
    fetchIPFromIPWho();
    fetchIPFromIPAPICo();
}

function updateCell(id, text, isError) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        if (isError) el.classList.add('status-error');
    }
}

// -- Domestic --
function fetchIPFromMyipIpip() {
    fetch('https://myip.ipip.net/', { mode: 'cors' })
        .then(r => r.text())
        .then(data => {
            const ipMatch = data.match(/([\d]+\.[\d]+\.[\d]+\.[\d]+)/);
            const locMatch = data.match(/来自于：([^\n<]+)/);
            updateCell('ipip-ip', ipMatch ? ipMatch[1] : '获取失败', !ipMatch);
            updateCell('ipip-loc', locMatch ? locMatch[1].trim() : '未知', !locMatch);
        })
        .catch(() => {
            updateCell('ipip-ip', '获取失败', true);
            updateCell('ipip-loc', '-', true);
        });
}

function fetchIPFromSpeedtest() {
    fetch('https://api-v3.speedtest.cn/ip', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
            if (data && data.code === 0 && data.data) {
                const d = data.data;
                updateCell('speedtest-ip', d.ip);
                updateCell('speedtest-loc', [d.country, d.province, d.city, d.isp].filter(Boolean).join(' '));
            } else throw new Error();
        })
        .catch(() => {
            updateCell('speedtest-ip', '获取失败', true);
            updateCell('speedtest-loc', '-', true);
        });
}

function fetchIPFromUseragent() {
    // useragentinfo.com may block CORS, try multiple approaches
    fetch('https://ip.useragentinfo.com/json', { mode: 'cors' })
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(data => {
            if (data && data.ip) {
                updateCell('useragent-ip', data.ip);
                updateCell('useragent-loc', [data.country, data.province, data.city, data.isp].filter(Boolean).join(' '));
            } else throw new Error('no ip');
        })
        .catch(() => {
            // Fallback to ipwho.is as replacement
            fetch('https://ipwho.is/', { mode: 'cors' })
                .then(r => r.json())
                .then(data => {
                    if (data && data.ip) {
                        updateCell('useragent-ip', data.ip);
                        updateCell('useragent-loc', [data.country, data.region, data.city, data.connection?.isp].filter(Boolean).join(' '));
                    } else throw new Error();
                })
                .catch(() => {
                    updateCell('useragent-ip', '获取失败', true);
                    updateCell('useragent-loc', '-', true);
                });
        });
}

// -- Foreign --
function fetchIPFromIPAPI() {
    fetch('http://ip-api.com/json/?lang=zh-CN&fields=query,country,regionName,city,isp,org,as', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
            if (data && data.query) {
                updateCell('ipapi-ip', data.query);
                updateCell('ipapi-loc', [data.country, data.regionName, data.city, data.isp].filter(Boolean).join(' '));
            } else throw new Error();
        })
        .catch(() => {
            updateCell('ipapi-ip', '获取失败', true);
            updateCell('ipapi-loc', '-', true);
        });
}

function fetchIPFromIPInfo() {
    fetch('https://ipinfo.io/json', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
            if (data && data.ip) {
                updateCell('ipinfo-ip', data.ip);
                updateCell('ipinfo-loc', [data.country, data.region, data.city, data.org].filter(Boolean).join(' '));
            } else throw new Error();
        })
        .catch(() => {
            updateCell('ipinfo-ip', '获取失败', true);
            updateCell('ipinfo-loc', '-', true);
        });
}

function fetchIPFromIPSB() {
    fetch('https://api.ip.sb/geoip', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
            if (data && data.ip) {
                updateCell('ipsb-ip', data.ip);
                updateCell('ipsb-loc', [data.country, data.region, data.city, data.organization].filter(Boolean).join(' '));
            } else throw new Error();
        })
        .catch(() => {
            updateCell('ipsb-ip', '获取失败', true);
            updateCell('ipsb-loc', '-', true);
        });
}

function fetchIPFromIPWho() {
    fetch('https://ipwho.is/', { mode: 'cors' })
        .then(r => r.json())
        .then(data => {
            if (data && data.ip) {
                updateCell('ipwho-ip', data.ip);
                updateCell('ipwho-loc', [data.country, data.region, data.city, data.connection?.isp].filter(Boolean).join(' '));
            } else throw new Error();
        })
        .catch(() => {
            updateCell('ipwho-ip', '获取失败', true);
            updateCell('ipwho-loc', '-', true);
        });
}

function fetchIPFromIPAPICo() {
    // ipapi.co has strict rate limits; add timeout and fallback
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch('https://ipapi.co/json/', { mode: 'cors', signal: controller.signal })
        .then(r => {
            clearTimeout(timeout);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(data => {
            if (data && data.ip && !data.error) {
                updateCell('ipapico-ip', data.ip);
                updateCell('ipapico-loc', [data.country_name, data.region, data.city, data.org].filter(Boolean).join(' '));
            } else throw new Error('rate limited or error');
        })
        .catch(() => {
            clearTimeout(timeout);
            // Fallback to ifconfig.me
            fetch('https://ifconfig.me/all.json', { mode: 'cors' })
                .then(r => r.json())
                .then(data => {
                    if (data && data.ip_addr) {
                        updateCell('ipapico-ip', data.ip_addr);
                        updateCell('ipapico-loc', data.forwarded || 'ifconfig.me');
                    } else throw new Error();
                })
                .catch(() => {
                    updateCell('ipapico-ip', '获取失败', true);
                    updateCell('ipapico-loc', '-', true);
                });
        });
}

// ========== CDN Tests ==========
function initCDNTests() {
    const cdnList = [
        { name: 'Cloudflare', url: 'https://www.cloudflare.com/cdn-cgi/trace', parse: 'cloudflare' },
        { name: 'Google', url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js', parse: 'timing' },
        { name: 'jsDelivr', url: 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js', parse: 'timing' },
        { name: 'Fastly', url: 'https://fastly.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js', parse: 'timing' },
        { name: 'AWS CloudFront', url: 'https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS-Logo_White.png', parse: 'timing' },
        { name: 'Azure CDN', url: 'https://azure.microsoft.com/favicon.ico', parse: 'timing' },
        { name: 'Bunny CDN', url: 'https://bunnycdn.com/favicon.ico', parse: 'timing' },
        { name: '腾讯云 CDN', url: 'https://cloudcache.tencent-cloud.com/qcloud/favicon.ico', parse: 'timing' },
        { name: '阿里云 CDN', url: 'https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico', parse: 'timing' },
        { name: '华为云 CDN', url: 'https://www.huaweicloud.com/favicon.ico', parse: 'timing' },
        { name: '网宿 CDN', url: 'https://www.wangsu.com/favicon.ico', parse: 'timing' },
        { name: '又拍云', url: 'https://www.upyun.com/favicon.ico', parse: 'timing' },
    ];

    const grid = document.getElementById('cdn-grid');
    if (!grid) return;

    cdnList.forEach((cdn, i) => {
        const card = document.createElement('div');
        card.className = 'cdn-card';
        card.id = `cdn-${i}`;
        card.innerHTML = `
            <div class="cdn-name">${cdn.name}</div>
            <div class="cdn-result"><span class="loading-dot"></span></div>
            <div class="cdn-time"></div>
        `;
        grid.appendChild(card);
        testCDN(cdn, i);
    });
}

function testCDN(cdn, index) {
    const card = document.getElementById(`cdn-${index}`);
    const resultEl = card.querySelector('.cdn-result');
    const timeEl = card.querySelector('.cdn-time');
    const start = performance.now();

    if (cdn.parse === 'cloudflare') {
        fetch(cdn.url, { mode: 'cors', cache: 'no-store' })
            .then(r => r.text())
            .then(text => {
                const elapsed = Math.round(performance.now() - start);
                const colo = text.match(/colo=(\w+)/);
                resultEl.textContent = colo ? colo[1] : 'OK';
                timeEl.textContent = `${elapsed}ms`;
                card.classList.add('success');
            })
            .catch(() => {
                resultEl.textContent = '不可达';
                card.classList.add('error');
            });
    } else {
        const img = new Image();
        img.onload = () => {
            const elapsed = Math.round(performance.now() - start);
            resultEl.textContent = '可达';
            timeEl.textContent = `${elapsed}ms`;
            card.classList.add('success');
        };
        img.onerror = () => {
            // Try fetch as fallback
            fetch(cdn.url, { mode: 'no-cors', cache: 'no-store' })
                .then(() => {
                    const elapsed = Math.round(performance.now() - start);
                    resultEl.textContent = '可达';
                    timeEl.textContent = `${elapsed}ms`;
                    card.classList.add('success');
                })
                .catch(() => {
                    resultEl.textContent = '不可达';
                    card.classList.add('error');
                });
        };
        img.src = cdn.url + '?t=' + Date.now();
    }
}

// ========== Connectivity Checks ==========
function initConnectivityChecks() {
    const sites = [
        { name: '百度', url: 'https://www.baidu.com/favicon.ico' },
        { name: '腾讯', url: 'https://www.qq.com/favicon.ico' },
        { name: '网易', url: 'https://www.163.com/favicon.ico' },
        { name: 'B站', url: 'https://www.bilibili.com/favicon.ico' },
        { name: 'Google', url: 'https://www.google.com/favicon.ico' },
        { name: 'YouTube', url: 'https://www.youtube.com/favicon.ico' },
        { name: 'GitHub', url: 'https://github.com/favicon.ico' },
        { name: 'Twitter', url: 'https://x.com/favicon.ico' },
        { name: 'Wikipedia', url: 'https://www.wikipedia.org/favicon.ico' },
        { name: 'ChatGPT', url: 'https://chatgpt.com/favicon.ico' },
        { name: 'Netflix', url: 'https://www.netflix.com/favicon.ico' },
        { name: 'Telegram', url: 'https://telegram.org/favicon.ico' },
    ];

    const grid = document.getElementById('connectivity-grid');
    if (!grid) return;

    sites.forEach((site, i) => {
        const card = document.createElement('div');
        card.className = 'conn-card';
        card.id = `conn-${i}`;
        card.innerHTML = `
            <div class="conn-icon"><img src="${site.url}" alt="${site.name}" style="width:24px;height:24px;border-radius:4px;object-fit:contain;" onerror="this.style.display='none'"></div>
            <div class="conn-name">${site.name}</div>
            <div class="conn-status"><span class="loading-dot"></span></div>
        `;
        grid.appendChild(card);
    });

    // Sequential testing for accuracy
    testSitesSequentially(sites, 0);
}

function testSitesSequentially(sites, index) {
    if (index >= sites.length) return;

    const site = sites[index];
    const card = document.getElementById(`conn-${index}`);
    const statusEl = card.querySelector('.conn-status');
    const start = performance.now();

    const timeout = setTimeout(() => {
        statusEl.textContent = '超时';
        statusEl.style.color = 'var(--danger)';
        card.classList.add('unreachable');
        testSitesSequentially(sites, index + 1);
    }, 6000);

    fetch(site.url, { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            clearTimeout(timeout);
            const elapsed = Math.round(performance.now() - start);
            statusEl.textContent = `${elapsed}ms`;
            statusEl.style.color = elapsed < 300 ? 'var(--success)' : elapsed < 1000 ? 'var(--warning)' : 'var(--danger)';
            card.classList.add('reachable');
            testSitesSequentially(sites, index + 1);
        })
        .catch(() => {
            clearTimeout(timeout);
            const elapsed = Math.round(performance.now() - start);
            if (elapsed < 4000) {
                statusEl.textContent = `${elapsed}ms`;
                statusEl.style.color = elapsed < 300 ? 'var(--success)' : 'var(--warning)';
                card.classList.add('reachable');
            } else {
                statusEl.textContent = '不可达';
                statusEl.style.color = 'var(--danger)';
                card.classList.add('unreachable');
            }
            testSitesSequentially(sites, index + 1);
        });
}


// ========== Toggle Controls ==========
function initToggles() {
    const hideIP = document.getElementById('toggle-hide-ip');
    const hideLoc = document.getElementById('toggle-hide-loc');

    if (hideIP) {
        hideIP.addEventListener('change', () => {
            document.querySelectorAll('.ip-cell').forEach(el => {
                el.classList.toggle('masked', hideIP.checked);
            });
        });
    }

    if (hideLoc) {
        hideLoc.addEventListener('change', () => {
            document.querySelectorAll('.location-cell').forEach(el => {
                el.classList.toggle('masked', hideLoc.checked);
            });
        });
    }
}
