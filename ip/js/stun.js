// ========== STUN / WebRTC IP Detection (Real Implementation) ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    startSTUNDetection();
});

function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('show'));
    }
}

const stunServers = [
    { name: 'Google STUN #1', url: 'stun:stun.l.google.com:19302' },
    { name: 'Google STUN #2', url: 'stun:stun1.l.google.com:19302' },
    { name: 'Google STUN #3', url: 'stun:stun2.l.google.com:19302' },
    { name: 'Google STUN #4', url: 'stun:stun3.l.google.com:19302' },
    { name: 'Cloudflare STUN', url: 'stun:stun.cloudflare.com:3478' },
    { name: 'Twilio STUN', url: 'stun:global.stun.twilio.com:3478' },
];

function startSTUNDetection() {
    const grid = document.getElementById('stun-grid');
    const summaryEl = document.getElementById('stun-summary');
    const natTypeEl = document.getElementById('nat-type');
    const localEl = document.getElementById('local-ips');
    const publicEl = document.getElementById('public-ips');

    // Check WebRTC support
    if (!window.RTCPeerConnection) {
        grid.innerHTML = '<div class="info-box" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.3);color:var(--danger);">浏览器不支持 WebRTC，无法进行 STUN 检测。</div>';
        summaryEl.textContent = '不支持 WebRTC';
        natTypeEl.textContent = '无法检测';
        localEl.textContent = '-';
        publicEl.textContent = '-';
        return;
    }

    // Reset UI
    summaryEl.innerHTML = '<span class="loading-dot"></span> 正在检测...';
    natTypeEl.innerHTML = '<span class="loading-dot"></span> 分析中...';
    localEl.innerHTML = '<span class="loading-dot"></span>';
    publicEl.innerHTML = '<span class="loading-dot"></span>';

    grid.innerHTML = stunServers.map((s, i) => `
        <div class="stun-card" id="stun-${i}">
            <h3>${s.name}</h3>
            <div class="stun-value"><span class="loading-dot"></span></div>
            <div class="stun-detail">服务器: ${s.url}</div>
        </div>
    `).join('');

    // Collect all results for NAT type analysis
    const allResults = { local: new Set(), public: new Set(), serverResults: [] };

    // Run each STUN server test
    stunServers.forEach((server, i) => {
        detectSTUN(server, i, allResults);
    });

    // Run general detection for local/public IP summary
    detectAllCandidates(allResults, localEl, publicEl, summaryEl, natTypeEl);
}

function detectSTUN(server, index, allResults) {
    const card = document.getElementById(`stun-${index}`);
    const valueEl = card.querySelector('.stun-value');
    const detailEl = card.querySelector('.stun-detail');

    const pc = new RTCPeerConnection({ iceServers: [{ urls: server.url }] });
    const candidates = [];
    let resolved = false;

    const timeout = setTimeout(() => {
        if (!resolved) {
            resolved = true;
            pc.close();
            if (candidates.length === 0) {
                valueEl.textContent = '超时 / 无响应';
                valueEl.style.color = 'var(--danger)';
                detailEl.textContent = `服务器 ${server.url} 未响应`;
            }
        }
    }, 6000);

    pc.onicecandidate = (event) => {
        if (!event.candidate) {
            // ICE gathering done
            clearTimeout(timeout);
            resolved = true;
            pc.close();
            if (candidates.length === 0) {
                valueEl.textContent = '无候选者';
                valueEl.style.color = 'var(--warning)';
            }
            return;
        }

        const candidateStr = event.candidate.candidate;
        if (!candidateStr) return;

        const parsed = parseCandidate(candidateStr);
        if (!parsed || !parsed.ip) return;

        // Skip mDNS (.local) addresses
        if (parsed.ip.endsWith('.local')) return;

        // Avoid duplicate display
        if (candidates.includes(parsed.ip)) return;
        candidates.push(parsed.ip);

        // Categorize
        if (parsed.type === 'srflx') {
            allResults.public.add(parsed.ip);
            allResults.serverResults.push({ server: server.name, ip: parsed.ip });

            valueEl.textContent = parsed.ip;
            valueEl.style.color = 'var(--success)';
            detailEl.textContent = `端口: ${parsed.port} | 类型: srflx (公网反射)`;
        } else if (parsed.type === 'host') {
            if (isPrivateIP(parsed.ip)) {
                allResults.local.add(parsed.ip);
            } else {
                allResults.public.add(parsed.ip);
            }

            if (!valueEl.textContent || valueEl.querySelector('.loading-dot')) {
                valueEl.textContent = parsed.ip;
                valueEl.style.color = 'var(--accent)';
                detailEl.textContent = `端口: ${parsed.port} | 类型: host (本地)`;
            }
        } else if (parsed.type === 'relay') {
            valueEl.textContent = parsed.ip;
            valueEl.style.color = 'var(--warning)';
            detailEl.textContent = `端口: ${parsed.port} | 类型: relay (中继)`;
        }
    };

    // Create data channel and offer to trigger ICE
    pc.createDataChannel('stun-test');
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {
            clearTimeout(timeout);
            resolved = true;
            valueEl.textContent = '创建连接失败';
            valueEl.style.color = 'var(--danger)';
        });
}

function detectAllCandidates(allResults, localEl, publicEl, summaryEl, natTypeEl) {
    // Use Google STUN for a comprehensive candidate gathering
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' },
        ]
    });

    const localIPs = new Set();
    const publicIPs = new Set();

    pc.onicecandidate = (event) => {
        if (!event.candidate) {
            // Done
            pc.close();
            finalizeSummary(localIPs, publicIPs, allResults, localEl, publicEl, summaryEl, natTypeEl);
            return;
        }

        const parsed = parseCandidate(event.candidate.candidate);
        if (!parsed || !parsed.ip || parsed.ip.endsWith('.local')) return;

        if (isPrivateIP(parsed.ip)) {
            localIPs.add(parsed.ip);
        } else {
            publicIPs.add(parsed.ip);
        }

        // Update displays in real-time
        localEl.textContent = localIPs.size > 0 ? [...localIPs].join(', ') : '检测中...';
        publicEl.textContent = publicIPs.size > 0 ? [...publicIPs].join(', ') : '检测中...';
    };

    pc.createDataChannel('all-candidates');
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {
            localEl.textContent = '检测失败';
            publicEl.textContent = '检测失败';
        });

    // Fallback timeout
    setTimeout(() => {
        pc.close();
        finalizeSummary(localIPs, publicIPs, allResults, localEl, publicEl, summaryEl, natTypeEl);
    }, 8000);
}

function finalizeSummary(localIPs, publicIPs, allResults, localEl, publicEl, summaryEl, natTypeEl) {
    const allLocal = new Set([...localIPs, ...allResults.local]);
    const allPublic = new Set([...publicIPs, ...allResults.public]);

    localEl.textContent = allLocal.size > 0 ? [...allLocal].join(', ') : '未检测到';
    publicEl.textContent = allPublic.size > 0 ? [...allPublic].join(', ') : '未检测到 (可能被浏览器阻止)';

    // Summary
    if (allPublic.size > 0) {
        summaryEl.innerHTML = `WebRTC 公网 IP: <span style="font-family:var(--mono);color:var(--accent);">${[...allPublic].join(', ')}</span>`;
    } else {
        summaryEl.textContent = '未通过 WebRTC 获取到公网 IP（可能被浏览器/扩展阻止）';
    }

    // NAT type analysis
    const serverIPs = allResults.serverResults.map(r => r.ip);
    const uniqueServerIPs = [...new Set(serverIPs)];

    if (uniqueServerIPs.length === 0) {
        natTypeEl.textContent = '无法确定 — 未从 STUN 获取到反射候选';
        natTypeEl.style.color = 'var(--text-secondary)';
    } else if (uniqueServerIPs.length === 1) {
        natTypeEl.innerHTML = `<span style="color:var(--success);">Full Cone NAT / 端口受限锥型</span> — 所有 STUN 服务器返回相同 IP: ${uniqueServerIPs[0]}`;
    } else {
        natTypeEl.innerHTML = `<span style="color:var(--warning);">Symmetric NAT (对称型)</span> — 不同 STUN 服务器返回了 ${uniqueServerIPs.length} 个不同 IP: ${uniqueServerIPs.join(', ')}`;
    }
}

function parseCandidate(candidateStr) {
    if (!candidateStr) return null;
    // Format: candidate:... UDP/TCP <priority> <ip> <port> typ <type>
    const parts = candidateStr.split(' ');
    if (parts.length < 8) return null;

    const ip = parts[4];
    const port = parts[5];
    const type = parts[7]; // host, srflx, relay

    return { ip, port, type };
}

function isPrivateIP(ip) {
    if (!ip || ip.includes(':')) return false; // Treat IPv6 as public for simplicity
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return false;
    const [a, b] = parts;
    return (a === 10) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 127) || (a === 169 && b === 254);
}
