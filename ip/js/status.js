// ========== Service Status Monitor (Sequential Testing) ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startStatusCheck();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

const serviceGroups = {
    search: [
        { name: 'Google', url: 'https://www.google.com/favicon.ico' },
        { name: 'Bing', url: 'https://www.bing.com/favicon.ico' },
        { name: '百度', url: 'https://www.baidu.com/favicon.ico' },
        { name: 'DuckDuckGo', url: 'https://duckduckgo.com/favicon.ico' },
        { name: 'Yandex', url: 'https://yandex.com/favicon.ico' },
    ],
    social: [
        { name: 'Twitter/X', url: 'https://x.com/favicon.ico' },
        { name: 'Facebook', url: 'https://www.facebook.com/favicon.ico' },
        { name: 'Instagram', url: 'https://www.instagram.com/favicon.ico' },
        { name: 'Telegram', url: 'https://telegram.org/favicon.ico' },
        { name: 'Discord', url: 'https://discord.com/favicon.ico' },
        { name: 'WhatsApp', url: 'https://web.whatsapp.com/favicon.ico' },
        { name: 'Reddit', url: 'https://www.reddit.com/favicon.ico' },
        { name: '微博', url: 'https://weibo.com/favicon.ico' },
    ],
    streaming: [
        { name: 'YouTube', url: 'https://www.youtube.com/favicon.ico' },
        { name: 'Netflix', url: 'https://www.netflix.com/favicon.ico' },
        { name: 'Spotify', url: 'https://www.spotify.com/favicon.ico' },
        { name: 'Twitch', url: 'https://www.twitch.tv/favicon.ico' },
        { name: 'Disney+', url: 'https://www.disneyplus.com/favicon.ico' },
        { name: 'B站', url: 'https://www.bilibili.com/favicon.ico' },
        { name: '爱奇艺', url: 'https://www.iqiyi.com/favicon.ico' },
    ],
    dev: [
        { name: 'GitHub', url: 'https://github.com/favicon.ico' },
        { name: 'GitLab', url: 'https://gitlab.com/favicon.ico' },
        { name: 'StackOverflow', url: 'https://stackoverflow.com/favicon.ico' },
        { name: 'npm', url: 'https://www.npmjs.com/favicon.ico' },
        { name: 'Docker Hub', url: 'https://hub.docker.com/favicon.ico' },
        { name: 'Vercel', url: 'https://vercel.com/favicon.ico' },
        { name: 'Netlify', url: 'https://www.netlify.com/favicon.ico' },
    ],
    ai: [
        { name: 'ChatGPT', url: 'https://chat.openai.com/favicon.ico' },
        { name: 'Claude', url: 'https://claude.ai/favicon.ico' },
        { name: 'Gemini', url: 'https://gemini.google.com/favicon.ico' },
        { name: 'Copilot', url: 'https://copilot.microsoft.com/favicon.ico' },
        { name: 'Perplexity', url: 'https://www.perplexity.ai/favicon.ico' },
        { name: 'DeepSeek', url: 'https://chat.deepseek.com/favicon.ico' },
        { name: 'Kimi', url: 'https://kimi.moonshot.cn/favicon.ico' },
        { name: 'HuggingFace', url: 'https://huggingface.co/favicon.ico' },
    ],
    cloud: [
        { name: 'AWS', url: 'https://aws.amazon.com/favicon.ico' },
        { name: 'Azure', url: 'https://azure.microsoft.com/favicon.ico' },
        { name: 'GCP', url: 'https://cloud.google.com/favicon.ico' },
        { name: 'Cloudflare', url: 'https://www.cloudflare.com/favicon.ico' },
        { name: '阿里云', url: 'https://www.aliyun.com/favicon.ico' },
        { name: '腾讯云', url: 'https://cloud.tencent.com/favicon.ico' },
    ],
};

function startStatusCheck() {
    document.getElementById('status-last-check').textContent = `上次检测: ${new Date().toLocaleString()}`;

    Object.entries(serviceGroups).forEach(([group, services]) => {
        const grid = document.getElementById(`grid-${group}`);
        if (!grid) return;

        grid.innerHTML = services.map((s, i) => `
            <div class="conn-card" id="status-${group}-${i}">
                <div class="conn-icon"><img src="${s.url}" alt="${s.name}" style="width:22px;height:22px;border-radius:4px;object-fit:contain;" onerror="this.style.display='none'"></div>
                <div class="conn-name">${s.name}</div>
                <div class="conn-status"><span class="loading-dot"></span></div>
            </div>
        `).join('');

        // Sequential testing within each group
        testGroupSequentially(services, group, 0);
    });
}

function testGroupSequentially(services, group, index) {
    if (index >= services.length) return;

    const service = services[index];
    const card = document.getElementById(`status-${group}-${index}`);
    const statusEl = card.querySelector('.conn-status');
    const start = performance.now();

    const timeout = setTimeout(() => {
        statusEl.textContent = '超时';
        statusEl.style.color = 'var(--danger)';
        card.classList.add('unreachable');
        testGroupSequentially(services, group, index + 1);
    }, 6000);

    fetch(service.url, { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            clearTimeout(timeout);
            const elapsed = Math.round(performance.now() - start);
            statusEl.textContent = `${elapsed}ms`;
            statusEl.style.color = elapsed < 300 ? 'var(--success)' : elapsed < 1000 ? 'var(--warning)' : 'var(--danger)';
            card.classList.add('reachable');
            testGroupSequentially(services, group, index + 1);
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
            testGroupSequentially(services, group, index + 1);
        });
}
