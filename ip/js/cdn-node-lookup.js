// ========== CDN Node Lookup ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startCDNLookup();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

const cdnProviders = [
    {
        name: 'Cloudflare',
        type: '国际',
        url: 'https://www.cloudflare.com/cdn-cgi/trace',
        method: 'trace',
        description: '全球最大的 CDN 之一'
    },
    {
        name: 'Cloudflare (1.1.1.1)',
        type: '国际',
        url: 'https://1.1.1.1/cdn-cgi/trace',
        method: 'trace',
        description: 'Cloudflare DNS 节点'
    },
    {
        name: 'Google (ajax)',
        type: '国际',
        url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
        method: 'timing',
        description: 'Google 静态资源 CDN'
    },
    {
        name: 'jsDelivr',
        type: '国际',
        url: 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
        method: 'timing',
        description: '免费开源 CDN'
    },
    {
        name: 'jsDelivr (Fastly)',
        type: '国际',
        url: 'https://fastly.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
        method: 'timing',
        description: 'jsDelivr Fastly 节点'
    },
    {
        name: 'jsDelivr (CloudFlare)',
        type: '国际',
        url: 'https://testingcf.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
        method: 'timing',
        description: 'jsDelivr Cloudflare 节点'
    },
    {
        name: 'UNPKG',
        type: '国际',
        url: 'https://unpkg.com/jquery@3.7.1/dist/jquery.min.js',
        method: 'timing',
        description: 'npm CDN by Cloudflare'
    },
    {
        name: 'AWS CloudFront',
        type: '国际',
        url: 'https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS-Logo_White.png',
        method: 'timing',
        description: 'Amazon Web Services CDN'
    },
    {
        name: 'Azure CDN',
        type: '国际',
        url: 'https://azure.microsoft.com/favicon.ico',
        method: 'timing',
        description: 'Microsoft Azure CDN'
    },
    {
        name: 'Bunny CDN',
        type: '国际',
        url: 'https://bunnycdn.com/favicon.ico',
        method: 'timing',
        description: '高性能全球 CDN'
    },
    {
        name: '腾讯云 CDN',
        type: 'CN',
        url: 'https://cloudcache.tencent-cloud.com/qcloud/favicon.ico',
        method: 'timing',
        description: '腾讯云内容分发网络'
    },
    {
        name: '阿里云 CDN',
        type: 'CN',
        url: 'https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico',
        method: 'timing',
        description: '阿里云全站加速'
    },
    {
        name: '华为云 CDN',
        type: 'CN',
        url: 'https://www.huaweicloud.com/favicon.ico',
        method: 'timing',
        description: '华为云内容分发网络'
    },
    {
        name: '又拍云',
        type: 'CN',
        url: 'https://www.upyun.com/favicon.ico',
        method: 'timing',
        description: '又拍云 CDN 加速'
    },
    {
        name: '网宿科技',
        type: 'CN',
        url: 'https://www.wangsu.com/favicon.ico',
        method: 'timing',
        description: '网宿科技 CDN'
    },
    {
        name: '百度云 CDN',
        type: 'CN',
        url: 'https://cloud.baidu.com/favicon.ico',
        method: 'timing',
        description: '百度智能云 CDN'
    },
];

function startCDNLookup() {
    const grid = document.getElementById('cdn-detail-grid');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;';
    grid.innerHTML = cdnProviders.map((cdn, i) => `
        <div class="stun-card" id="cdn-detail-${i}">
            <h3>${cdn.name} <span class="badge ${cdn.type === 'CN' ? 'badge-blue' : 'badge-green'}">${cdn.type}</span></h3>
            <div class="stun-value"><span class="loading-dot"></span></div>
            <div class="stun-detail">${cdn.description}</div>
        </div>
    `).join('');

    cdnProviders.forEach((cdn, i) => testCDNNode(cdn, i));
}

function testCDNNode(cdn, index) {
    const card = document.getElementById(`cdn-detail-${index}`);
    const valueEl = card.querySelector('.stun-value');
    const detailEl = card.querySelector('.stun-detail');
    const start = performance.now();

    if (cdn.method === 'trace') {
        fetch(cdn.url, { mode: 'cors', cache: 'no-store' })
            .then(r => r.text())
            .then(text => {
                const elapsed = Math.round(performance.now() - start);
                const colo = text.match(/colo=(\w+)/);
                const ip = text.match(/ip=(.+)/);
                const warp = text.match(/warp=(\w+)/);

                valueEl.textContent = colo ? `节点: ${colo[1]}` : '已连接';
                valueEl.style.color = 'var(--success)';

                let details = [`延迟: ${elapsed}ms`];
                if (ip) details.push(`出口IP: ${ip[1]}`);
                if (warp) details.push(`WARP: ${warp[1]}`);
                detailEl.textContent = details.join(' | ');
            })
            .catch(() => {
                valueEl.textContent = '不可达';
                valueEl.style.color = 'var(--danger)';
                detailEl.textContent = cdn.description;
            });
    } else {
        // Timing-based test using fetch
        fetch(cdn.url, { mode: 'no-cors', cache: 'no-store' })
            .then(() => {
                const elapsed = Math.round(performance.now() - start);
                valueEl.textContent = `可达 (${elapsed}ms)`;
                valueEl.style.color = elapsed < 200 ? 'var(--success)' : elapsed < 800 ? 'var(--warning)' : 'var(--danger)';
                detailEl.textContent = `延迟: ${elapsed}ms | ${cdn.description}`;
            })
            .catch(() => {
                valueEl.textContent = '不可达';
                valueEl.style.color = 'var(--danger)';
                detailEl.textContent = cdn.description;
            });
    }
}
