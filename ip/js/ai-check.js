// ========== AI Service Availability Check ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startAICheck();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

const aiServices = [
    {
        name: 'ChatGPT',
        icon: '🤖',
        domain: 'chat.openai.com',
        urls: ['https://chat.openai.com', 'https://api.openai.com'],
        description: 'OpenAI ChatGPT'
    },
    {
        name: 'Claude',
        icon: '🧠',
        domain: 'claude.ai',
        urls: ['https://claude.ai', 'https://api.anthropic.com'],
        description: 'Anthropic Claude'
    },
    {
        name: 'Gemini',
        icon: '✨',
        domain: 'gemini.google.com',
        urls: ['https://gemini.google.com'],
        description: 'Google Gemini'
    },
    {
        name: 'Copilot',
        icon: '🚀',
        domain: 'copilot.microsoft.com',
        urls: ['https://copilot.microsoft.com'],
        description: 'Microsoft Copilot'
    },
    {
        name: 'Perplexity',
        icon: '🔮',
        domain: 'www.perplexity.ai',
        urls: ['https://www.perplexity.ai'],
        description: 'Perplexity AI'
    },
    {
        name: 'Poe',
        icon: '💡',
        domain: 'poe.com',
        urls: ['https://poe.com'],
        description: 'Quora Poe'
    },
    {
        name: 'Midjourney',
        icon: '🎨',
        domain: 'www.midjourney.com',
        urls: ['https://www.midjourney.com'],
        description: 'Midjourney AI Art'
    },
    {
        name: 'Stability AI',
        icon: '🖼️',
        domain: 'stability.ai',
        urls: ['https://stability.ai'],
        description: 'Stable Diffusion'
    },
    {
        name: 'HuggingFace',
        icon: '🤗',
        domain: 'huggingface.co',
        urls: ['https://huggingface.co'],
        description: 'HuggingFace Hub'
    },
    {
        name: 'Groq',
        icon: '⚡',
        domain: 'groq.com',
        urls: ['https://groq.com'],
        description: 'Groq LPU Inference'
    },
    {
        name: '通义千问',
        icon: '🌐',
        domain: 'tongyi.aliyun.com',
        urls: ['https://tongyi.aliyun.com'],
        description: '阿里通义千问'
    },
    {
        name: '文心一言',
        icon: '📝',
        domain: 'yiyan.baidu.com',
        urls: ['https://yiyan.baidu.com'],
        description: '百度文心一言'
    },
    {
        name: 'Kimi',
        icon: '🌙',
        domain: 'kimi.moonshot.cn',
        urls: ['https://kimi.moonshot.cn'],
        description: 'Moonshot Kimi'
    },
    {
        name: 'DeepSeek',
        icon: '🔍',
        domain: 'chat.deepseek.com',
        urls: ['https://chat.deepseek.com'],
        description: 'DeepSeek Chat'
    },
];

function startAICheck() {
    const grid = document.getElementById('ai-grid');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;';
    grid.innerHTML = aiServices.map((s, i) => `
        <div class="stun-card" id="ai-card-${i}" style="position:relative;">
            <h3><span style="font-size:22px;margin-right:4px;">${s.icon}</span> ${s.name}</h3>
            <div class="stun-value"><span class="loading-dot"></span></div>
            <div class="stun-detail">${s.description} — ${s.domain}</div>
            <div id="ai-dns-${i}" style="margin-top:8px;font-size:12px;color:var(--text-secondary);"></div>
        </div>
    `).join('');

    aiServices.forEach((service, i) => checkAIService(service, i));
}

function checkAIService(service, index) {
    const card = document.getElementById(`ai-card-${index}`);
    const valueEl = card.querySelector('.stun-value');
    const dnsEl = document.getElementById(`ai-dns-${index}`);

    const start = performance.now();
    const mainUrl = service.urls[0];

    // Test connectivity
    fetch(mainUrl + '/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            const elapsed = Math.round(performance.now() - start);
            valueEl.innerHTML = `<span style="color:var(--success);font-weight:700;">✓ 可达</span> <span style="font-family:var(--mono);font-size:13px;">${elapsed}ms</span>`;
            card.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        })
        .catch(() => {
            const elapsed = Math.round(performance.now() - start);
            if (elapsed < 5000) {
                // Quick failure might still mean reachable (CORS)
                valueEl.innerHTML = `<span style="color:var(--warning);font-weight:700;">⚠ 可能可达</span> <span style="font-family:var(--mono);font-size:13px;">${elapsed}ms</span>`;
                card.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            } else {
                valueEl.innerHTML = `<span style="color:var(--danger);font-weight:700;">✗ 不可达</span>`;
                card.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }
        });

    // DNS resolve
    fetch(`https://dns.google/resolve?name=${service.domain}&type=A`)
        .then(r => r.json())
        .then(data => {
            if (data.Answer && data.Answer.length > 0) {
                const ips = data.Answer.filter(a => a.type === 1).map(a => a.data);
                if (ips.length > 0) {
                    dnsEl.innerHTML = `<span style="color:var(--text-secondary);">DNS:</span> <span style="font-family:var(--mono);color:var(--accent);">${ips.slice(0, 3).join(', ')}</span>`;
                    // Get IP info for first IP
                    fetch(`http://ip-api.com/json/${ips[0]}?fields=country,city,org,as&lang=zh-CN`)
                        .then(r => r.json())
                        .then(info => {
                            const parts = [info.country, info.city, info.org].filter(Boolean);
                            if (parts.length > 0) {
                                dnsEl.innerHTML += `<br><span style="font-size:11px;opacity:0.7;">${parts.join(' | ')}${info.as ? ' (' + info.as + ')' : ''}</span>`;
                            }
                        }).catch(() => {});
                }
            } else {
                dnsEl.innerHTML = `<span style="color:var(--text-secondary);font-size:11px;">DNS 无 A 记录</span>`;
            }
        })
        .catch(() => {
            dnsEl.innerHTML = `<span style="color:var(--danger);font-size:11px;">DNS 解析失败</span>`;
        });
}
