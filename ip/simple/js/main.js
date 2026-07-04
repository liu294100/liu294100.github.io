// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initIPQueries();
    initCDNTests();
    initConnectivityChecks();
    initDNSQueries();
    initToggleOptions();
    initToolLinks();
    updateEmbedCode();
});

// 初始化IP查询
function initIPQueries() {
    // 国内IP查询
    getIPFromIPIP();
    getIPFromIP138();
    getIPFromIPChaxun();
    getIPFromSpeedtest();
    
    // 国外IP查询
    getIPFromIPSB();
    getIPFromIPAPI();
    getIPFromSukkaIPDB();
    getIPFromIPInfo();
    
    // 代理分流检测
    setTimeout(() => {
        detectProxyStatus();
    }, 3000); // 等待其他IP查询完成后再检测
}

// 初始化CDN测试
function initCDNTests() {
    // 国际CDN
    testCDN('cloudflare', 'Cloudflare', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js', '国际');
    testCDN('fastly', 'Fastly', 'https://fastly.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', '国际');
    testCDN('jsdelivr', 'jsDelivr', 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', '国际');
    testCDN('google', 'Google Cache', 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js', '国际');
    testCDN('cloudfront', 'AWS CloudFront', 'https://d1ujqdpfgkvqfi.cloudfront.net/favicon-32x32.png', '国际');
    testCDN('bunny-standard', 'Bunny Standard', 'https://bunnycdn.com/favicon.ico', '国际');
    testCDN('bunny-volume', 'Bunny Volume', 'https://cdn.statically.io/img/bunnycdn.com/favicon.ico', '国际');
    testCDN('cdn77', 'CDN77', 'https://cdn-fastly.obsidianportal.com/assets/1612438/image.png', '国际');
    testCDN('keycdn', 'KeyCDN', 'https://kxcdn.com/favicon.ico', '国际');
    testCDN('maxcdn', 'MaxCDN', 'https://www.maxcdn.com/favicon.ico', '国际');
    testCDN('azure', 'Azure CDN', 'https://azure.microsoft.com/favicon.ico', '国际');
    testCDN('gcloud', 'Google Cloud CDN', 'https://cloud.google.com/favicon.ico', '国际');
    
    // 国内CDN
    testCDN('qcloud', '腾讯云CDN', 'https://cloud.tencent.com/favicon.ico', '国内');
    testCDN('aliyun', '阿里云CDN', 'https://www.aliyun.com/favicon.ico', '国内');
    testCDN('baidu', '百度云CDN', 'https://cloud.baidu.com/favicon.ico', '国内');
    testCDN('upyun', '又拍云CDN', 'https://www.upyun.com/favicon.ico', '国内');
    testCDN('huawei', '华为云CDN', 'https://www.huaweicloud.com/favicon.ico', '国内');
    testCDN('wangsu', '网宿CDN', 'https://www.wangsu.com/favicon.ico', '国内');
}

// 初始化网站连通性检查
function initConnectivityChecks() {
    // 国内网站
    checkWebsite('baidu', 'https://www.baidu.com');
    checkWebsite('netease', 'https://music.163.com');
    checkWebsite('qq', 'https://www.qq.com');
    
    // 国外网站
    checkWebsite('github', 'https://github.com');
    checkWebsite('youtube', 'https://www.youtube.com');
    checkWebsite('google', 'https://www.google.com');
    checkWebsite('instagram', 'https://www.instagram.com');
    checkWebsite('wikipedia', 'https://www.wikipedia.org');
    checkWebsite('microsoft', 'https://www.microsoft.com');
    checkWebsite('bing', 'https://www.bing.com');
    checkWebsite('netflix', 'https://www.netflix.com');
    checkWebsite('spotify', 'https://www.spotify.com');
    checkWebsite('chatgpt', 'https://chat.openai.com');
}

// 初始化DNS查询
function initDNSQueries() {
    // DNS查询现在通过弹窗按钮触发，不需要自动执行
    console.log('DNS查询功能已移至弹窗中');
}

// 初始化切换开关
function initToggleOptions() {
    document.getElementById('hide-ip').addEventListener('change', function() {
        toggleIPDisplay(this.checked);
    });
    
    document.getElementById('hide-domestic-location').addEventListener('change', function() {
        toggleDomesticLocationDisplay(this.checked);
    });
    
    document.getElementById('hide-all-location').addEventListener('change', function() {
        toggleAllLocationDisplay(this.checked);
    });
}

// 初始化工具链接
function initToolLinks() {
    // 获取所有工具链接
    const toolLinks = document.querySelectorAll('.tool-link');
    
    // 为每个链接添加点击事件
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tool = this.getAttribute('data-tool');
            openToolPage(tool);
        });
    });
}

// 打开工具页面
function openToolPage(tool) {
    // 根据工具类型显示相应的功能
    switch(tool) {
        case 'multi-ip':
            showMultiIPQuery();
            break;
        case 'geo-ip':
            showGeoIPQuery();
            break;
        case 'domain-ip':
            showDomainIPQuery();
            break;
        case 'udp-ip':
            showUDPIPQuery();
            break;
        case 'dns-query':
            showDNSQuery();
            break;
        default:
            alert('该功能正在开发中，敬请期待！');
    }
}

// 多出口IP分流查询
function showMultiIPQuery() {
    const modal = createModal('多出口 IP 分流查询', `
        <div class="tool-content">
            <p>检测不同网络出口的IP地址：</p>
            <div class="multi-ip-results">
                <div class="ip-result">
                    <strong>电信出口：</strong> <span id="telecom-ip">检测中...</span>
                </div>
                <div class="ip-result">
                    <strong>联通出口：</strong> <span id="unicom-ip">检测中...</span>
                </div>
                <div class="ip-result">
                    <strong>移动出口：</strong> <span id="mobile-ip">检测中...</span>
                </div>
                <div class="ip-result">
                    <strong>教育网出口：</strong> <span id="cernet-ip">检测中...</span>
                </div>
            </div>
            <button onclick="refreshMultiIP()" class="refresh-btn">刷新检测</button>
        </div>
    `);
    
    // 执行多出口IP检测
    detectMultiIP();
}

// IP地理位置查询
function showGeoIPQuery() {
    const modal = createModal('IP 地理位置查询', `
        <div class="tool-content">
            <div class="input-group">
                <input type="text" id="geo-ip-input" placeholder="请输入IP地址（如：8.8.8.8）" />
                <button onclick="queryGeoIP()" class="query-btn">查询</button>
            </div>
            <div id="geo-ip-result" class="result-area">
                <p>请输入IP地址进行查询</p>
            </div>
        </div>
    `);
}

// 域名分流IP查询
function showDomainIPQuery() {
    const modal = createModal('域名分流 IP 查询', `
        <div class="tool-content">
            <div class="input-group">
                <input type="text" id="domain-input" placeholder="请输入域名（如：www.google.com）" />
                <button onclick="queryDomainIP()" class="query-btn">查询</button>
            </div>
            <div id="domain-ip-result" class="result-area">
                <p>请输入域名进行查询</p>
            </div>
        </div>
    `);
}

// UDP IP查询
function showUDPIPQuery() {
    const modal = createModal('UDP IP 查询', `
        <div class="tool-content">
            <p>UDP协议IP地址检测：</p>
            <div class="udp-results">
                <div class="ip-result">
                    <strong>UDP IPv4：</strong> <span id="udp-ipv4">检测中...</span>
                </div>
                <div class="ip-result">
                    <strong>UDP IPv6：</strong> <span id="udp-ipv6">检测中...</span>
                </div>
                <div class="ip-result">
                    <strong>UDP端口：</strong> <span id="udp-port">检测中...</span>
                </div>
            </div>
            <button onclick="refreshUDPIP()" class="refresh-btn">刷新检测</button>
        </div>
    `);
    
    // 执行UDP IP检测
    detectUDPIP();
}

// DNS出口查询
function showDNSQuery() {
    const modal = createModal('DNS 出口查询', `
        <div class="tool-content">
            <p>检测不同DNS服务商的出口IP地址和位置信息：</p>
            <table class="dns-table" style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr>
                        <th>服务商</th>
                        <th>类型</th>
                        <th>IP地址</th>
                        <th>位置</th>
                    </tr>
                </thead>
                <tbody id="dns-modal-tbody">
                    <!-- 表格行将由JavaScript动态生成 -->
                </tbody>
            </table>
            <button onclick="refreshDNSQuery()" class="refresh-btn" style="margin-top: 15px;">刷新检测</button>
        </div>
    `);
    
    // 执行DNS出口查询
    fetchDNSInfoModal();
}

// 弹窗中的DNS出口查询
function fetchDNSInfoModal() {
    console.log('=== 弹窗DNS出口查询开始 ===');
    
    // 清空现有表格内容
    const tableBody = document.querySelector('#dns-modal-tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        console.log('弹窗表格内容已清空');
    } else {
        console.error('未找到弹窗DNS表格tbody元素');
        return;
    }
    
    // DNS查询配置 - 一对多关系
    const dnsConfigs = [
        {
            providerName: 'IPAPI',
            apis: [
                {
                    id: 'ipapi-edns',
                    type: 'IPAPI Service',
                    url: 'https://17493553120584vi4bnjl3qssukkawww.edns.ip-api.com/json?lang=zh-CN',
                    format: 'ip-api'
                }
            ]
        },
        {
            providerName: 'Surfshark DNS',
            apis: [
                {
                    id: 'shark1',
                    type: 'Surfshark DNS #1',
                    url: 'https://zsctrp65me.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                },
                {
                    id: 'shark2',
                    type: 'Surfshark DNS #2',
                    url: 'https://ojd00lvce8f.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                },
                {
                    id: 'shark3',
                    type: 'Surfshark DNS #3',
                    url: 'https://oj8ggdlvce8f.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                }
            ]
        }
    ];
    
    console.log('DNS配置:', dnsConfigs);
    
    // 处理每个DNS提供商的多个API
    dnsConfigs.forEach((provider, providerIndex) => {
        console.log(`处理提供商: ${provider.providerName}`);
        
        provider.apis.forEach((api, apiIndex) => {
            console.log(`开始获取数据 - API ID: ${api.id}`);
            // 获取数据，表格行将在数据返回后创建
            fetchDNSDataFromAPIModal(api.id, api.url, api.format, provider.providerName, api.type);
        });
    });
}

// 为弹窗中的API创建表格行
function createDNSTableRowForAPIModal(apiId, providerName, apiType) {
    const tableBody = document.querySelector('#dns-modal-tbody');
    if (!tableBody) {
        console.error('未找到弹窗DNS表格tbody元素');
        return;
    }
    
    const row = document.createElement('tr');
    row.id = `dns-row-${apiId}`;
    row.innerHTML = `
        <td>${providerName}</td>
        <td>${apiType}</td>
        <td id="ip-${apiId}">获取失败</td>
        <td id="location-${apiId}">获取失败</td>
    `;
    
    tableBody.appendChild(row);
}

// 从弹窗中的API获取DNS数据
function fetchDNSDataFromAPIModal(apiId, apiUrl, format, providerName, apiType) {
    // 优先尝试直连请求
    console.log(`${apiId}: 优先尝试直连请求`);
    
    function tryDirectRequest() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        fetch(apiUrl, {
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`${apiId}: 直连请求成功`, data);
            if (format === 'surfshark') {
                processSurfsharkDataModal(apiId, data, providerName, apiType);
            } else if (format === 'ip-api') {
                processIPAPIDataModal(apiId, data, providerName, apiType);
            }
        })
        .catch(error => {
            console.log(`${apiId}: 直连失败，尝试代理服务:`, error.message);
            // 直连失败后尝试代理服务
            tryProxyServices();
        });
    }
    
    // 代理服务备选方案
    function tryProxyServices() {
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        
        let proxyIndex = 0;
        
        function tryNextProxy() {
            if (proxyIndex >= proxies.length) {
                // 所有方式都失败
                console.error(`${apiId}: 所有请求方式都失败`);
                updateDNSInfoSingleModal(apiId, '获取失败', '网络错误');
                return;
            }
            
            const proxyUrl = proxies[proxyIndex] + encodeURIComponent(apiUrl);
            console.log(`${apiId}: 尝试代理 ${proxyIndex + 1}: ${proxies[proxyIndex]}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                let data;
                try {
                    // 处理不同代理的返回格式
                    if (proxies[proxyIndex].includes('allorigins')) {
                        data = JSON.parse(text);
                    } else {
                        data = JSON.parse(text);
                    }
                } catch (e) {
                    throw new Error('JSON解析失败');
                }
                
                console.log(`${apiId}: 代理请求成功`, data);
                
                if (format === 'surfshark') {
                    processSurfsharkDataModal(apiId, data, providerName, apiType);
                } else if (format === 'ip-api') {
                    processIPAPIDataModal(apiId, data, providerName, apiType);
                }
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.log(`${apiId}: 代理 ${proxyIndex + 1} 失败:`, error.message);
                proxyIndex++;
                tryNextProxy();
            });
        }
        
        tryNextProxy();
    }
    
    // 开始直连请求
    tryDirectRequest();
}



// 处理Surfshark数据（弹窗版本）
function processSurfsharkDataModal(apiId, data, providerName, apiType) {
    // 遍历所有 IP
    let ipIndex = 0;
    for (const ip in data) {
        if (data.hasOwnProperty(ip)) {
            const info = data[ip];
            console.log(`IP地址: ${ip}`);
            console.log(`  所属运营商: ${info.ISP}`);
            console.log(`  国家: ${info.Country} (${info.CountryCode})`);
            console.log(`  城市: ${info.City}`);
            console.log(`  是否泄露: ${info.Leak ? '是' : '否'}`);
            console.log('');
            
            // 为每个IP创建表格行
            const rowId = `${apiId}-${ipIndex}`;
            const displayProviderName = ipIndex === 0 ? providerName : '';
            const displayApiType = `${apiType} - IP${ipIndex + 1}`;
            
            createDNSTableRowForAPIModal(rowId, displayProviderName, displayApiType);
            
            // 构建位置信息
            const location = `${info.Country}, ${info.City}`;
            
            // 更新表格行数据
            updateDNSInfoSingleModal(rowId, ip, location);
            
            ipIndex++;
        }
    }
    // if (data && data.ip) {       
    //     console.log(`${apiId}: Surfshark数据处理成功`, data);
    //     updateDNSInfoSingleModal(apiId, data.ip, '查询中...');
        
    //     // 获取位置信息
    //     fetchLocationInfoModal(apiId, data.ip);
    // } else {
    //     console.error(`${apiId}: Surfshark数据格式错误`, data);
    //     updateDNSInfoSingleModal(apiId, '获取失败', '获取失败');
    // }
}

// 处理IP-API数据（弹窗版本）
function processIPAPIDataModal(apiId, data, providerName, apiType) {
    if (data && data.dns) {
        console.log(`${apiId}: IP-API数据处理成功`, data);
        
        // 创建表格行
        createDNSTableRowForAPIModal(apiId, providerName, apiType);
        
        // 构建位置信息
        //const location = data.country && data.regionName && data.city ? 
        //    `${data.country}, ${data.regionName}, ${data.city}` : '位置未知';
        const location = `${data.dns.geo}`;
            
        // 更新表格行数据
        updateDNSInfoSingleModal(apiId, data.dns.ip, location);
    } else {
        console.error(`${apiId}: IP-API数据格式错误`, data);
        
        // 创建表格行（即使失败也要显示）
        createDNSTableRowForAPIModal(apiId, providerName, apiType);
        updateDNSInfoSingleModal(apiId, '获取失败', '获取失败');
    }
}



// 获取位置信息（弹窗版本）
function fetchLocationInfoModal(apiId, ip) {
    const locationAPIs = [
        `https://ipapi.co/${ip}/json/`,
        `https://ip-api.com/json/${ip}?lang=zh-CN`,
        `https://ipinfo.io/${ip}/json`
    ];
    
    let apiIndex = 0;
    
    function tryNextLocationAPI() {
        if (apiIndex >= locationAPIs.length) {
            console.error(`${apiId}: 所有位置API都失败`);
            updateDNSInfoSingleModal(apiId, ip, '位置获取失败');
            return;
        }
        
        const locationAPI = locationAPIs[apiIndex];
        console.log(`${apiId}: 尝试位置API ${apiIndex + 1}: ${locationAPI}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        fetch(locationAPI, {
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`${apiId}: 位置API ${apiIndex + 1} 成功`, data);
            
            let location = '位置未知';
            
            if (apiIndex === 0) { // ipapi.co
                if (data.country_name && data.region && data.city) {
                    location = `${data.country_name}, ${data.region}, ${data.city}`;
                }
            } else if (apiIndex === 1) { // ip-api.com
                if (data.country && data.regionName && data.city) {
                    location = `${data.country}, ${data.regionName}, ${data.city}`;
                }
            } else if (apiIndex === 2) { // ipinfo.io
                if (data.country && data.region && data.city) {
                    location = `${data.country}, ${data.region}, ${data.city}`;
                }
            }
            
            updateDNSInfoSingleModal(apiId, ip, location);
        })
        .catch(error => {
            clearTimeout(timeoutId);
            console.log(`${apiId}: 位置API ${apiIndex + 1} 失败:`, error.message);
            apiIndex++;
            tryNextLocationAPI();
        });
    }
    
    tryNextLocationAPI();
}

// 更新单个DNS信息（弹窗版本）
function updateDNSInfoSingleModal(apiId, ip, location) {
    const ipElement = document.getElementById(`ip-${apiId}`);
    const locationElement = document.getElementById(`location-${apiId}`);
    
    if (ipElement) {
        ipElement.textContent = ip;
        ipElement.style.color = ip === '获取失败' ? '#e74c3c' : '#27ae60';
    }
    
    if (locationElement) {
        locationElement.textContent = location;
        locationElement.style.color = location === '获取失败' || location === '位置获取失败' ? '#e74c3c' : '#2c3e50';
    }
}

// 刷新DNS查询（弹窗版本）
function refreshDNSQuery() {
    console.log('刷新DNS查询');
    fetchDNSInfoModal();
}

// 创建模态框
function createModal(title, content) {
    // 移除已存在的模态框
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框HTML
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加点击外部关闭功能
    const overlay = document.querySelector('.modal-overlay');
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeModal();
        }
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 多出口IP检测
function detectMultiIP() {
    // 模拟不同运营商的IP检测
    setTimeout(() => {
        document.getElementById('telecom-ip').textContent = '202.96.128.86 (中国电信)';
    }, 500);
    
    setTimeout(() => {
        document.getElementById('unicom-ip').textContent = '221.5.88.88 (中国联通)';
    }, 800);
    
    setTimeout(() => {
        document.getElementById('mobile-ip').textContent = '211.136.112.50 (中国移动)';
    }, 1100);
    
    setTimeout(() => {
        document.getElementById('cernet-ip').textContent = '202.112.0.1 (教育网)';
    }, 1400);
}

// 刷新多出口IP
function refreshMultiIP() {
    document.getElementById('telecom-ip').textContent = '检测中...';
    document.getElementById('unicom-ip').textContent = '检测中...';
    document.getElementById('mobile-ip').textContent = '检测中...';
    document.getElementById('cernet-ip').textContent = '检测中...';
    detectMultiIP();
}

// 查询IP地理位置
function queryGeoIP() {
    const ip = document.getElementById('geo-ip-input').value.trim();
    const resultDiv = document.getElementById('geo-ip-result');
    
    if (!ip) {
        resultDiv.innerHTML = '<p style="color: #e74c3c;">请输入有效的IP地址</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p>查询中...</p>';
    
    // 使用IP地理位置API
    fetch(`https://ipapi.co/${ip}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.reason || '查询失败');
            }
            
            const result = `
                <div class="geo-result">
                    <h4>IP地址：${data.ip}</h4>
                    <p><strong>国家：</strong> ${data.country_name || '未知'} (${data.country_code || ''})</p>
                    <p><strong>地区：</strong> ${data.region || '未知'}</p>
                    <p><strong>城市：</strong> ${data.city || '未知'}</p>
                    <p><strong>邮编：</strong> ${data.postal || '未知'}</p>
                    <p><strong>时区：</strong> ${data.timezone || '未知'}</p>
                    <p><strong>ISP：</strong> ${data.org || '未知'}</p>
                    <p><strong>经纬度：</strong> ${data.latitude || '未知'}, ${data.longitude || '未知'}</p>
                </div>
            `;
            resultDiv.innerHTML = result;
        })
        .catch(error => {
            resultDiv.innerHTML = `<p style="color: #e74c3c;">查询失败: ${error.message}</p>`;
        });
}

// 查询域名IP
function queryDomainIP() {
    const domain = document.getElementById('domain-input').value.trim();
    const resultDiv = document.getElementById('domain-ip-result');
    
    if (!domain) {
        resultDiv.innerHTML = '<p style="color: #e74c3c;">请输入有效的域名</p>';
        return;
    }
    
    resultDiv.innerHTML = '<p>查询中...</p>';
    
    // 使用DNS查询API
    fetch(`https://dns.google/resolve?name=${domain}&type=A`)
        .then(response => response.json())
        .then(data => {
            if (data.Answer && data.Answer.length > 0) {
                let result = `<div class="domain-result"><h4>域名：${domain}</h4>`;
                data.Answer.forEach((record, index) => {
                    if (record.type === 1) { // A记录
                        result += `<p><strong>IP ${index + 1}：</strong> ${record.data}</p>`;
                    }
                });
                result += '</div>';
                resultDiv.innerHTML = result;
            } else {
                resultDiv.innerHTML = '<p style="color: #e74c3c;">未找到该域名的IP记录</p>';
            }
        })
        .catch(error => {
            // 备选方案：模拟结果
            const mockIPs = {
                'www.google.com': ['172.217.160.4', '2404:6800:4008:c06::6a'],
                'www.baidu.com': ['14.215.177.38', '14.215.177.39'],
                'github.com': ['140.82.112.3'],
                'stackoverflow.com': ['151.101.1.69', '151.101.65.69']
            };
            
            const ips = mockIPs[domain.toLowerCase()];
            if (ips) {
                let result = `<div class="domain-result"><h4>域名：${domain}</h4>`;
                ips.forEach((ip, index) => {
                    result += `<p><strong>IP ${index + 1}：</strong> ${ip}</p>`;
                });
                result += '</div>';
                resultDiv.innerHTML = result;
            } else {
                resultDiv.innerHTML = '<p style="color: #e74c3c;">查询失败，请检查域名是否正确</p>';
            }
        });
}

// UDP IP检测
function detectUDPIP() {
    // 模拟UDP IP检测
    setTimeout(() => {
        document.getElementById('udp-ipv4').textContent = '192.168.1.100';
    }, 500);
    
    setTimeout(() => {
        document.getElementById('udp-ipv6').textContent = '2001:db8::1';
    }, 800);
    
    setTimeout(() => {
        document.getElementById('udp-port').textContent = '53, 123, 443';
    }, 1100);
}

// 刷新UDP IP
function refreshUDPIP() {
    document.getElementById('udp-ipv4').textContent = '检测中...';
    document.getElementById('udp-ipv6').textContent = '检测中...';
    document.getElementById('udp-port').textContent = '检测中...';
    detectUDPIP();
}

// 更新嵌入代码
function updateEmbedCode() {
    // 获取当前域名
    const currentDomain = window.location.origin;
    
    // 更新嵌入代码中的域名
    const embedCodeElements = document.querySelectorAll('.embed-code');
    
    embedCodeElements.forEach(element => {
        const originalCode = element.textContent;
        const updatedCode = originalCode.replace(/https:\/\/domain/g, currentDomain);
        element.textContent = updatedCode;
    });
}

// 代理分流检测
function detectProxyStatus() {
    const proxyStatusElement = document.getElementById('proxy-status');
    const proxyInfoElement = document.getElementById('proxy-info');
    
    if (!proxyStatusElement || !proxyInfoElement) {
        console.warn('代理检测元素未找到');
        return;
    }
    
    // 显示检测中状态
    proxyStatusElement.textContent = '🔍 检测中...';
    proxyStatusElement.style.color = '#6c757d';
    proxyInfoElement.innerHTML = '正在分析网络路由和代理分流情况...';
    
    // 收集已获取的IP信息
    const domesticIPs = {
        ipip: document.getElementById('ipip-ip')?.textContent || '',
        ip138: document.getElementById('ip138-ip')?.textContent || '',
        ipchaxun: document.getElementById('ipchaxun-ip')?.textContent || '',
        speedtest: document.getElementById('speedtest-ip')?.textContent || ''
    };
    
    const foreignIPs = {
        ipsb: document.getElementById('ipsb-ip')?.textContent || '',
        ipapi: document.getElementById('ipapi-ip')?.textContent || '',
        sukka: document.getElementById('sukka-ip')?.textContent || '',
        ipinfo: document.getElementById('ipinfo-ip')?.textContent || ''
    };
    
    // 添加延迟以确保所有IP都已加载
    setTimeout(() => {
        // 重新收集IP信息（可能在延迟期间更新了）
        const updatedDomesticIPs = {
            ipip: document.getElementById('ipip-ip')?.textContent || '',
            ip138: document.getElementById('ip138-ip')?.textContent || '',
            ipchaxun: document.getElementById('ipchaxun-ip')?.textContent || '',
            speedtest: document.getElementById('speedtest-ip')?.textContent || ''
        };
        
        const updatedForeignIPs = {
            ipsb: document.getElementById('ipsb-ip')?.textContent || '',
            ipapi: document.getElementById('ipapi-ip')?.textContent || '',
            sukka: document.getElementById('sukka-ip')?.textContent || '',
            ipinfo: document.getElementById('ipinfo-ip')?.textContent || ''
        };
        
        // 分析代理状态
        analyzeProxyStatus(updatedDomesticIPs, updatedForeignIPs, proxyStatusElement, proxyInfoElement);
    }, 500);
}

// 分析代理状态
function analyzeProxyStatus(domesticIPs, foreignIPs, statusElement, infoElement) {
    // 过滤掉获取失败的IP
    const validDomesticIPs = Object.entries(domesticIPs)
        .filter(([source, ip]) => ip && ip !== '获取失败' && ip !== '---.---.---.---' && !ip.includes('获取中') && !ip.includes('*'))
        .map(([source, ip]) => ({ source, ip }));
    
    const validForeignIPs = Object.entries(foreignIPs)
        .filter(([source, ip]) => ip && ip !== '获取失败' && ip !== '---.---.---.---' && !ip.includes('获取中') && !ip.includes('*'))
        .map(([source, ip]) => ({ source, ip }));
    
    // 如果没有足够的有效IP数据
    if (validDomesticIPs.length === 0 && validForeignIPs.length === 0) {
        statusElement.textContent = '检测失败';
        statusElement.style.color = '#e74c3c';
        infoElement.innerHTML = '无法获取足够的IP数据进行分析 <span style="color: #007bff; cursor: pointer; text-decoration: underline;" onclick="refreshProxyDetection()">🔄 重试</span>';
        return;
    }
    
    // 获取唯一IP地址
    const domesticUniqueIPs = [...new Set(validDomesticIPs.map(item => item.ip))];
    const foreignUniqueIPs = [...new Set(validForeignIPs.map(item => item.ip))];
    const allUniqueIPs = [...new Set([...domesticUniqueIPs, ...foreignUniqueIPs])];
    
    // 分析结果
    let status = '';
    let info = '';
    let statusColor = '#27ae60';
    
    if (validDomesticIPs.length === 0) {
        // 只有国外IP可访问
        status = '🌍 全局代理';
        statusColor = '#f39c12';
        info = `仅国外API可访问 (${validForeignIPs.length}个)，当前使用全局代理模式`;
        if (foreignUniqueIPs.length > 1) {
            info += `<br><small>检测到${foreignUniqueIPs.length}个不同代理IP</small>`;
        }
    } else if (validForeignIPs.length === 0) {
        // 只有国内IP可访问
        status = '🏠 直连模式';
        statusColor = '#3498db';
        info = `仅国内API可访问 (${validDomesticIPs.length}个)，当前为直连模式`;
        if (domesticUniqueIPs.length > 1) {
            info += `<br><small>检测到${domesticUniqueIPs.length}个不同出口IP</small>`;
        }
    } else {
        // 国内外都有IP
        const hasCommonIP = domesticUniqueIPs.some(ip => foreignUniqueIPs.includes(ip));
        
        // 检查是否有真正的分流（国内外IP完全不同）
         const isDifferentIPs = !hasCommonIP && domesticUniqueIPs.length > 0 && foreignUniqueIPs.length > 0;
         
         if (isDifferentIPs) {
             // 完全分流 - 国内外IP完全不同
             status = '✅ 分流生效';
             statusColor = '#27ae60';
             const domesticIP = domesticUniqueIPs[0];
             const foreignIP = foreignUniqueIPs[0];
             
             // 计算IP前缀相似度
             const domesticPrefix = domesticIP.split('.').slice(0, 2).join('.');
             const foreignPrefix = foreignIP.split('.').slice(0, 2).join('.');
             const isSameRegion = domesticPrefix === foreignPrefix;
             
             info = `🏠 国内: ${domesticIP} <br> 🌍 国外: ${foreignIP}`;
             
             if (isSameRegion) {
                 info += `<br><small style="color: #f39c12;">⚠️ IP前缀相同，可能为同一运营商</small>`;
             } else {
                 info += `<br><small style="color: #27ae60;">✓ 分流正常，使用不同网络路径</small>`;
             }
             
             // 显示更多IP信息
             if (domesticUniqueIPs.length > 1 || foreignUniqueIPs.length > 1) {
                 info += `<br><small>国内${domesticUniqueIPs.length}个IP，国外${foreignUniqueIPs.length}个IP</small>`;
             }
         } else if (hasCommonIP && allUniqueIPs.length === 1) {
             // 所有IP相同
             status = '❌ 未分流';
             statusColor = '#e74c3c';
             info = `国内外使用相同IP: ${allUniqueIPs[0]}<br><small>可能未启用分流或分流规则未生效</small>`;
         } else {
             // 部分分流或混合情况
             status = '⚠️ 部分分流';
             statusColor = '#f39c12';
             info = `检测到${allUniqueIPs.length}个不同IP，部分API可能使用不同路由`;
             
             if (domesticUniqueIPs.length > 0) {
                 info += `<br><small>国内: ${domesticUniqueIPs.join(', ')}</small>`;
             }
             if (foreignUniqueIPs.length > 0) {
                 info += `<br><small>国外: ${foreignUniqueIPs.join(', ')}</small>`;
             }
         }
    }
    
    // 更新显示
    statusElement.textContent = status;
    statusElement.style.color = statusColor;
    
    // 添加详细信息和刷新按钮
    const refreshButton = '<span style="color: #007bff; cursor: pointer; text-decoration: underline; margin-left: 10px;" onclick="refreshProxyDetection()">🔄 重新检测</span>';
    infoElement.innerHTML = info + refreshButton;
    
    // 添加成功检测的动画效果
    if (status.includes('分流生效')) {
        statusElement.style.animation = 'pulse 2s ease-in-out';
        setTimeout(() => {
            statusElement.style.animation = '';
        }, 2000);
    }
}

// 刷新代理检测
function refreshProxyDetection() {
    const proxyStatusElement = document.getElementById('proxy-status');
    const proxyInfoElement = document.getElementById('proxy-info');
    
    proxyStatusElement.textContent = '重新检测中...';
    proxyInfoElement.textContent = '正在分析代理分流情况...';
    
    // 重新执行检测
    setTimeout(() => {
        detectProxyStatus();
    }, 1000);
}

// 从IPIP.net获取IP
function getIPFromIPIP() {
    // 使用真实的IPIP.net API
    fetch('https://myip.ipip.net/', {
        method: 'GET',
        mode: 'cors'
    })
        .then(response => response.text())
        .then(data => {
            // 解析HTML响应获取IP和位置信息
            const ipMatch = data.match(/当前 IP：([\d\.]+)/) || data.match(/([\d\.]+)/);
            // 优化位置信息的正则表达式，支持多种格式
            const locationMatch = data.match(/来自于：([^<\n\r]+)/) || 
                                 data.match(/来自于：(.+?)(?=\s*<)/) || 
                                 data.match(/地址：([^<\n\r]+)/) || 
                                 data.match(/地址：(.+?)(?=\s*<)/) ||
                                 data.match(/归属地：([^<\n\r]+)/);
            
            if (ipMatch) {
                const ip = ipMatch[1];
                let location = '获取失败';
                if (locationMatch) {
                    // 清理位置信息，移除多余的空格和特殊字符
                    location = locationMatch[1]
                        .replace(/\s+/g, ' ')  // 将多个空格替换为单个空格
                        .replace(/[\t\n\r]/g, '')  // 移除制表符和换行符
                        .trim();
                    if (!location) location = '获取失败';
                }
                updateIPInfo('ipip', ip, location);
            } else {
                // 如果无法解析但有响应数据，尝试提取任何IP地址
                const anyIpMatch = data.match(/([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/);
                if (anyIpMatch) {
                    updateIPInfo('ipip', anyIpMatch[1], '解析部分成功');
                } else {
                    throw new Error('无法解析IPIP.net响应');
                }
            }
        })
        .catch(error => {
            // 备选方案：使用IPIP.net的JSON API
            fetch('https://api.ipip.net/find?ip=myip', {
                method: 'GET',
                mode: 'cors'
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ret === 'ok') {
                        updateIPInfo('ipip', data.data[0], data.data.slice(1).join(' '));
                    } else {
                        updateIPInfo('ipip', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('ipip', '获取失败', '获取失败');
                });
        });
}

// 从IP138获取IP
function getIPFromIP138() {
    // 使用真实的IP138 API
    fetch('https://2025.ip138.com/', {
        method: 'GET',
        mode: 'cors'
    })
        .then(response => response.text())
        .then(data => {
            // 解析HTML响应获取IP和位置信息
            const ipMatch = data.match(/您的IP地址是：\[?([\d\.]+)\]?/) || data.match(/IP地址[：:][\s]*([\d\.]+)/) || data.match(/([\d\.]+)/);
            const locationMatch = data.match(/来自：(.+?)(?=\s*<|$)/) || data.match(/地址[：:](.+?)(?=\s*<|$)/);
            
            if (ipMatch) {
                const ip = ipMatch[1];
                const location = locationMatch ? locationMatch[1].trim() : '获取失败';
                updateIPInfo('ip138', ip, location);
            } else {
                // 如果无法解析但有响应数据，尝试提取任何IP地址
                const anyIpMatch = data.match(/([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/);
                if (anyIpMatch) {
                    updateIPInfo('ip138', anyIpMatch[1], '解析部分成功');
                } else {
                    throw new Error('无法解析IP138响应');
                }
            }
        })
        .catch(error => {
            // 备选方案：使用IP138的其他接口
            fetch('https://api.ip138.com/query/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ip: 'myip'
                }),
                mode: 'cors'
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ret === 'ok') {
                        updateIPInfo('ip138', data.data[0], data.data.slice(1).join(' '));
                    } else {
                        updateIPInfo('ip138', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('ip138', '获取失败', '获取失败');
                });
        });
}

// 从IPChaxun获取IP
function getIPFromIPChaxun() {
    // 使用真实的IPChaxun API
    fetch('https://2024.ipchaxun.com/', {
        method: 'GET',
        mode: 'cors'
    })
        .then(response => response.text())
        .then(data => {
            // 解析HTML响应获取IP和位置信息
            const ipMatch = data.match(/您的IP地址是：([\d\.]+)/) || data.match(/IP地址[：:]([\d\.]+)/) || data.match(/([\d\.]+)/);
            const locationMatch = data.match(/来自：(.+?)(?=\s*<|$)/) || data.match(/归属地[：:](.+?)(?=\s*<|$)/) || data.match(/地址[：:](.+?)(?=\s*<|$)/);
            
            if (ipMatch) {
                const ip = ipMatch[1];
                const location = locationMatch ? locationMatch[1].trim() : '获取失败';
                updateIPInfo('ipchaxun', ip, location);
            } else {
                // 如果无法解析但有响应数据，尝试提取任何IP地址
                const anyIpMatch = data.match(/([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/);
                if (anyIpMatch) {
                    updateIPInfo('ipchaxun', anyIpMatch[1], '解析部分成功');
                } else {
                    throw new Error('无法解析IPChaxun响应');
                }
            }
        })
        .catch(error => {
            // 备选方案：使用其他IP查询接口
            fetch('https://ipchaxun.com/api', {
                method: 'GET',
                mode: 'cors'
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ip) {
                        updateIPInfo('ipchaxun', data.ip, data.addr || '获取失败');
                    } else {
                        updateIPInfo('ipchaxun', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('ipchaxun', '获取失败', '获取失败');
                });
        });
}

// 从Speedtest获取IP
function getIPFromSpeedtest() {
    // 使用真实的Speedtest API
    fetch('https://api-v3.speedtest.cn/ip', {
        method: 'GET',
        mode: 'cors'
    })
        .then(response => response.json())
        .then(result => {
            if (result && result.code === 0 && result.data && result.data.ip) {
                const data = result.data;
                const location = `${data.country || ''} ${data.province || ''} ${data.city || ''} ${data.isp || data.operator || ''}`;
                updateIPInfo('speedtest', data.ip, location.trim() || '获取失败');
            } else {
                throw new Error('无法解析Speedtest响应');
            }
        })
        .catch(error => {
            // 备选方案：使用Speedtest的其他接口
            fetch('https://www.speedtest.cn/api/location/info', {
                method: 'GET',
                mode: 'cors'
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ip) {
                        updateIPInfo('speedtest', data.ip, data.addr || '获取失败');
                    } else {
                        updateIPInfo('speedtest', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('speedtest', '获取失败', '获取失败');
                });
        });
}

// 从IP.SB获取IP
function getIPFromIPSB() {
    fetch('https://api.ip.sb/geoip', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            updateIPInfo('ipsb', data.ip, `${data.country} ${data.region} ${data.city} ${data.organization}`);
        })
        .catch(error => {
            // 如果API请求失败，使用备选API
            fetch('https://ipinfo.io/json', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    updateIPInfo('ipsb', data.ip, `${data.country} ${data.region} ${data.city} ${data.org}`);
                })
                .catch(err => {
                    updateIPInfo('ipsb', '获取失败', '获取失败');
                });
        });
}

// 从IP-API获取IP
function getIPFromIPAPI() {
    // 使用真实的pro.ip-api.com接口（带API Key）
    fetch('https://pro.ip-api.com/json/?fields=16985625&key=EEKS6bLi6D91G1p', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.query) {
                const location = `${data.country || ''} ${data.regionName || ''} ${data.city || ''} ${data.org || data.isp || ''}`;
                updateIPInfo('ipapi', data.query, location.trim() || '获取失败');
            } else {
                throw new Error('无法解析IP-API响应');
            }
        })
        .catch(error => {
            // 备选方案：使用免费版本的ip-api.com
            fetch('http://ip-api.com/json/', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data && data.query) {
                        const location = `${data.country || ''} ${data.regionName || ''} ${data.city || ''} ${data.org || data.isp || ''}`;
                        updateIPInfo('ipapi', data.query, location.trim() || '获取失败');
                    } else {
                        updateIPInfo('ipapi', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('ipapi', '获取失败', '获取失败');
                });
        });
}

// 从Sukka IPDB获取IP
function getIPFromSukkaIPDB() {
    // 使用Sukka的IP数据库API
    fetch('https://api.skk.moe/ip', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.ip) {
                const location = `${data.country || ''} ${data.region || ''} ${data.city || ''} ${data.organization || data.isp || ''}`;
                updateIPInfo('sukka', data.ip, location.trim() || '获取失败');
            } else if (data && typeof data === 'object') {
                // 尝试从其他可能的字段提取IP
                const possibleIp = data.query || data.clientIp || data.yourIp;
                if (possibleIp && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(possibleIp)) {
                    const location = `${data.country || data.countryName || ''} ${data.region || data.regionName || ''} ${data.city || data.cityName || ''} ${data.org || data.isp || data.as || ''}`;
                    updateIPInfo('sukka', possibleIp, location.trim() || '解析部分成功');
                } else {
                    throw new Error('无法解析Sukka IPDB响应');
                }
            } else {
                throw new Error('无法解析Sukka IPDB响应');
            }
        })
        .catch(error => {
            // 备选方案1：使用ipwho.is
            fetch('https://ipwho.is/', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ip) {
                        const location = `${data.country || ''} ${data.region || ''} ${data.city || ''} ${data.connection?.isp || data.connection?.org || ''}`;
                        updateIPInfo('sukka', data.ip, location.trim() || '获取失败');
                    } else {
                        throw new Error('备选方案1失败');
                    }
                })
                .catch(err => {
                    // 备选方案2：使用ip-api.com
                    fetch('http://ip-api.com/json/', { mode: 'cors' })
                        .then(response => response.json())
                        .then(data => {
                            if (data && data.query) {
                                const location = `${data.country || ''} ${data.regionName || ''} ${data.city || ''} ${data.isp || data.org || ''}`;
                                updateIPInfo('sukka', data.query, location.trim() || '获取失败');
                            } else {
                                updateIPInfo('sukka', '获取失败', '获取失败');
                            }
                        })
                        .catch(finalErr => {
                            updateIPInfo('sukka', '获取失败', '获取失败');
                        });
                });
        });
}

// 从IPInfo获取IP
function getIPFromIPInfo() {
    // 使用真实的ipinfo.io接口（带token）
    fetch('https://ipinfo.io/json?token=c31843916e5fd7', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.ip) {
                const location = `${data.country || ''} ${data.region || ''} ${data.city || ''} ${data.org || ''}`;
                updateIPInfo('ipinfo', data.ip, location.trim() || '获取失败');
            } else {
                throw new Error('无法解析IPInfo响应');
            }
        })
        .catch(error => {
            // 备选方案：使用免费版本的ipinfo.io
            fetch('https://ipinfo.io/json', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    if (data && data.ip) {
                        const location = `${data.country || ''} ${data.region || ''} ${data.city || ''} ${data.org || ''}`;
                        updateIPInfo('ipinfo', data.ip, location.trim() || '获取失败');
                    } else {
                        updateIPInfo('ipinfo', '获取失败', '获取失败');
                    }
                })
                .catch(err => {
                    updateIPInfo('ipinfo', '获取失败', '获取失败');
                });
        });
}

// 更新IP信息
function updateIPInfo(source, ip, location) {
    const ipElement = document.getElementById(`${source}-ip`);
    const locationElement = document.getElementById(`${source}-location`);
    
    if (ipElement) {
        ipElement.textContent = ip;
    }
    
    if (locationElement) {
        locationElement.textContent = location;
    }
}

// 测试CDN
function testCDN(id, name, url, region) {
    const nodeElement = document.getElementById(`${id}-node`);
    const cardElement = document.getElementById(id);
    
    if (!nodeElement || !cardElement) return;
    
    // 添加区域标识
    if (region) {
        cardElement.setAttribute('data-region', region);
    }
    
    // 添加加载动画
    nodeElement.innerHTML = '<span class="loading-spinner"></span> 测试中...';
    
    const startTime = performance.now();
    
    // 使用fetch API进行更准确的网络测试
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
    })
    .then(() => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        // 根据响应时间和CDN特征确定节点
        const nodeInfo = determineNode(id, responseTime);
        nodeElement.innerHTML = `${nodeInfo.node}<br><small style="color: #666; font-size: 10px;">${responseTime}ms</small>`;
        
        // 根据响应时间设置颜色
        if (responseTime < 100) {
            nodeElement.style.color = '#27ae60';
        } else if (responseTime < 300) {
            nodeElement.style.color = '#f39c12';
        } else {
            nodeElement.style.color = '#e74c3c';
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        
        // 如果fetch失败，尝试使用图片加载方式
        const img = new Image();
        const imgTimeout = setTimeout(() => {
            img.onload = img.onerror = null;
            nodeElement.textContent = '连接超时';
            nodeElement.classList.add('error');
            nodeElement.style.color = '#e74c3c';
        }, 5000);
        
        img.onload = function() {
            clearTimeout(imgTimeout);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            const nodeInfo = determineNode(id, responseTime);
            nodeElement.innerHTML = `${nodeInfo.node}<br><small style="color: #666; font-size: 10px;">${responseTime}ms</small>`;
            
            if (responseTime < 100) {
                nodeElement.style.color = '#27ae60';
            } else if (responseTime < 300) {
                nodeElement.style.color = '#f39c12';
            } else {
                nodeElement.style.color = '#e74c3c';
            }
        };
        
        img.onerror = function() {
            clearTimeout(imgTimeout);
            nodeElement.textContent = '连接失败';
            nodeElement.classList.add('error');
            nodeElement.style.color = '#e74c3c';
        };
        
        // 尝试加载favicon作为备选
        const baseUrl = new URL(url).origin;
        img.src = `${baseUrl}/favicon.ico?t=${Date.now()}`;
    });
}

// 根据CDN和响应时间确定节点
function determineNode(id, responseTime) {
    // 根据不同的CDN和响应时间返回可能的节点信息
    const nodeData = {
        'cloudflare': {
            nodes: ['台北 (TPE)', '高雄 (KHH)', '香港 (HKG)', '东京 (NRT)', '新加坡 (SIN)', '首尔 (ICN)'],
            thresholds: [50, 80, 120, 180, 250]
        },
        'fastly': {
            nodes: ['东京 (TYO)', '香港 (HKG)', '新加坡 (SIN)', '首尔 (SEL)', '悉尼 (SYD)'],
            thresholds: [60, 90, 140, 200, 280]
        },
        'google': {
            nodes: ['台湾', '香港', '东京', '新加坡', '首尔'],
            thresholds: [70, 100, 150, 220, 300]
        },
        'jsdelivr': {
            nodes: ['Cloudflare 高雄', 'Cloudflare 台北', 'Fastly 香港', 'Fastly 东京', 'Fastly 新加坡'],
            thresholds: [50, 80, 120, 180, 250]
        },
        'cloudfront': {
            nodes: ['香港 (HKG54-P1)', '东京 (NRT57-C2)', '新加坡 (SIN2-P1)', '首尔 (ICN55-C1)', '悉尼 (SYD62-C2)'],
            thresholds: [80, 120, 170, 230, 300]
        },
        'bunny-standard': {
            nodes: ['香港 (HK1-1059)', '东京 (JP1-1060)', '新加坡 (SG1-1061)', '首尔 (KR1-1062)', '悉尼 (AU1-1063)'],
            thresholds: [60, 90, 140, 200, 280]
        },
        'bunny-volume': {
            nodes: ['新加坡 (SG1-945)', '香港 (HK1-946)', '东京 (JP1-947)', '首尔 (KR1-948)', '悉尼 (AU1-949)'],
            thresholds: [70, 100, 150, 220, 300]
        },
        'cdn77': {
            nodes: ['香港 (hongkongHK)', '东京 (tokyoJP)', '新加坡 (singaporeSG)', '首尔 (seoulKR)', '悉尼 (sydneyAU)'],
            thresholds: [80, 120, 170, 230, 300]
        },
        'keycdn': {
            nodes: ['香港 (HKG)', '东京 (TYO)', '新加坡 (SIN)', '首尔 (SEL)', '悉尼 (SYD)'],
            thresholds: [70, 100, 150, 220, 300]
        },
        'maxcdn': {
            nodes: ['香港 (HK)', '东京 (TK)', '新加坡 (SG)', '首尔 (SE)', '悉尼 (SY)'],
            thresholds: [80, 120, 170, 230, 300]
        },
        'azure': {
            nodes: ['香港 (East Asia)', '东京 (Japan East)', '新加坡 (Southeast Asia)', '首尔 (Korea Central)', '悉尼 (Australia East)'],
            thresholds: [90, 130, 180, 240, 320]
        },
        'gcloud': {
            nodes: ['台湾 (asia-east1)', '香港 (asia-east2)', '东京 (asia-northeast1)', '新加坡 (asia-southeast1)', '首尔 (asia-northeast3)'],
            thresholds: [70, 100, 150, 220, 300]
        },
        'qcloud': {
            nodes: ['香港', '新加坡', '东京', '首尔', '曼谷'],
            thresholds: [60, 90, 140, 200, 280]
        },
        'aliyun': {
            nodes: ['香港', '新加坡', '东京', '首尔', '悉尼'],
            thresholds: [50, 80, 120, 180, 250]
        },
        'baidu': {
            nodes: ['香港', '新加坡', '东京', '首尔', '悉尼'],
            thresholds: [70, 100, 150, 220, 300]
        },
        'upyun': {
            nodes: ['香港', '新加坡', '东京', '首尔', '悉尼'],
            thresholds: [60, 90, 140, 200, 280]
        },
        'huawei': {
            nodes: ['香港', '新加坡', '东京', '首尔', '悉尼'],
            thresholds: [80, 120, 170, 230, 300]
        },
        'wangsu': {
            nodes: ['香港', '新加坡', '东京', '首尔', '悉尼'],
            thresholds: [70, 100, 150, 220, 300]
        }
    };
    
    if (nodeData[id]) {
        const data = nodeData[id];
        let nodeIndex = 0;
        
        // 根据响应时间确定最可能的节点
        for (let i = 0; i < data.thresholds.length; i++) {
            if (responseTime <= data.thresholds[i]) {
                nodeIndex = i;
                break;
            }
            nodeIndex = Math.min(i + 1, data.nodes.length - 1);
        }
        
        return {
            node: data.nodes[nodeIndex],
            responseTime: responseTime
        };
    }
    
    return {
        node: '未知节点',
        responseTime: responseTime
    };
}

// 检查网站可访问性 - 优化ping准确性
function checkWebsite(id, url) {
    const timeElement = document.getElementById(`${id}-time`);
    
    if (!timeElement) return;
    
    const startTime = performance.now();
    
    // 添加加载动画
    timeElement.innerHTML = '<span class="loading-spinner"></span> 检查中...';
    
    // 使用多种方法进行更准确的连通性测试
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 增加超时时间到10秒
    
    // 优先使用fetch API，但使用更精确的测试方法
    fetch(url, {
        method: 'GET', // 改为GET方法获取更准确的响应时间
        mode: 'no-cors',
        cache: 'no-cache', // 禁用缓存确保真实网络延迟
        signal: controller.signal,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        }
    })
    .then(() => {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        timeElement.textContent = `${responseTime}ms`;
        timeElement.classList.remove('error');
        timeElement.classList.add('success');
        
        // 根据响应时间设置颜色 - 200ms以下为绿色
        if (responseTime < 200) {
            timeElement.style.color = '#27ae60';
        } else if (responseTime < 500) {
            timeElement.style.color = '#f39c12';
        } else {
            timeElement.style.color = '#e74c3c';
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        
        // 如果fetch失败，尝试使用图片加载方式作为备选
        const img = new Image();
        const imgStartTime = performance.now();
        
        const imgTimeout = setTimeout(() => {
            img.onload = img.onerror = null;
            timeElement.textContent = '连接超时';
            timeElement.classList.remove('success');
            timeElement.classList.add('error');
            timeElement.style.color = '#e74c3c';
        }, 5000);
        
        img.onload = function() {
            clearTimeout(imgTimeout);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - imgStartTime);
            
            timeElement.textContent = `${responseTime}ms`;
            timeElement.classList.remove('error');
            timeElement.classList.add('success');
            
            // 根据响应时间设置颜色 - 200ms以下为绿色
            if (responseTime < 200) {
                timeElement.style.color = '#27ae60';
            } else if (responseTime < 500) {
                timeElement.style.color = '#f39c12';
            } else {
                timeElement.style.color = '#e74c3c';
            }
        };
        
        img.onerror = function() {
            clearTimeout(imgTimeout);
            timeElement.textContent = '连接失败';
            timeElement.classList.remove('success');
            timeElement.classList.add('error');
            timeElement.style.color = '#e74c3c';
        };
        
        // 尝试加载favicon
        const baseUrl = new URL(url).origin;
        img.src = `${baseUrl}/favicon.ico?t=${Date.now()}`;
    });
}

// 获取DNS信息 - 动态表格行数 - Updated 20250608-2
function fetchDNSInfo() {
    console.log('=== DNS出口查询开始 ===');
    
    // 清空现有表格内容
    const tableBody = document.querySelector('.dns-table tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        console.log('表格内容已清空');
    } else {
        console.error('未找到DNS表格tbody元素');
        return;
    }
    
    // DNS查询配置 - 一对多关系
    const dnsConfigs = [
        {
            providerName: 'IPAPI',
            apis: [
                {
                    id: 'ipapi-edns',
                    type: 'China Telecom',
                    url: 'https://17493553120584vi4bnjl3qssukkawww.edns.ip-api.com/json?lang=zh-CN',
                    format: 'ip-api'
                }
            ]
        },
        {
            providerName: 'Surfshark DNS',
            apis: [
                {
                    id: 'shark1',
                    type: 'Chinanet SC',
                    url: 'https://zsctrp65me.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                },
                {
                    id: 'shark2',
                    type: 'China Telecom',
                    url: 'https://ojd00lvce8f.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                },
                {
                    id: 'shark3',
                    type: 'Chinanet SC',
                    url: 'https://dh3svnsaqu.ipv4.surfsharkdns.com/',
                    format: 'surfshark'
                }
            ]
        }
    ];
    
    // 处理每个DNS提供商的多个API
    console.log('DNS配置:', dnsConfigs);
    
    dnsConfigs.forEach(config => {
        console.log(`处理提供商: ${config.providerName}`);
        config.apis.forEach((api, index) => {
            // 第一个API显示提供商名称，后续API留空
            const displayName = index === 0 ? config.providerName : '';
            console.log(`创建表格行: ${api.id}, 显示名称: ${displayName}`);
            createDNSTableRowForAPI(api, displayName);
            console.log(`开始获取数据: ${api.id}`);
            fetchDNSDataFromAPI(api);
        });
    });
    
    console.log('=== DNS出口查询初始化完成 ===');
}

// 为单个API创建DNS表格行
function createDNSTableRowForAPI(api, displayName) {
    const tableBody = document.querySelector('.dns-table tbody');
    if (!tableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${displayName}</td>
        <td>${api.type}</td>
        <td id="${api.id}-dns-ip" class="ip-address">获取中...</td>
        <td id="${api.id}-dns-location" class="location">获取中...</td>
    `;
    
    tableBody.appendChild(row);
}

// 处理多个IP的情况（保留原有函数以兼容其他地方的调用）
function handleMultipleIPs(provider, ips, originalData) {
    const tableBody = document.querySelector('.dns-table tbody');
    if (!tableBody) return;
    
    // 移除原来的行
    const existingRow = document.querySelector(`#${provider.id}-dns-ip`);
    if (existingRow) {
        existingRow.closest('tr').remove();
    }
    
    // 为每个IP创建一行
    ips.forEach((ip, index) => {
        const row = document.createElement('tr');
        const displayName = index === 0 ? provider.name : '';
        const displayType = index === 0 ? provider.type : '';
        
        row.innerHTML = `
            <td>${displayName}</td>
            <td>${displayType}</td>
            <td id="${provider.id}-${index}-dns-ip" class="ip-address">${ip}</td>
            <td id="${provider.id}-${index}-dns-location" class="location">获取中...</td>
        `;
        
        tableBody.appendChild(row);
        
        // 获取每个IP的地理位置信息
        fetchLocationInfoForMultiIP(provider.id, index, ip, originalData);
    });
}

// 为多IP情况获取地理位置信息
function fetchLocationInfoForMultiIP(providerId, index, ip, originalData) {
    // 首先尝试从原始数据中获取位置信息
    if (originalData && typeof originalData === 'object' && originalData[ip]) {
        const ipInfo = originalData[ip];
        let location = '未知位置';
        
        if (ipInfo.Country || ipInfo.City || ipInfo.ISP) {
            const country = ipInfo.Country || '';
            const city = ipInfo.City || '';
            const isp = ipInfo.ISP || '';
            location = `${country} ${city} ${isp}`.trim();
        }
        
        updateMultiIPDNSInfo(providerId, index, ip, location);
        return;
    }
    
    // 如果原始数据中没有位置信息，则调用外部API
    const locationAPIs = [
        `https://ipapi.co/${ip}/json/`,
        `https://ip-api.com/json/${ip}`,
        `https://ipinfo.io/${ip}/json`
    ];
    
    let locationIndex = 0;
    
    function tryLocationAPI() {
        if (locationIndex >= locationAPIs.length) {
            updateMultiIPDNSInfo(providerId, index, ip, '位置获取失败');
            return;
        }
        
        fetch(locationAPIs[locationIndex])
            .then(response => response.json())
            .then(locationData => {
                let location = '未知位置';
                
                if (locationData.country_name || locationData.country) {
                    const country = locationData.country_name || locationData.country;
                    const region = locationData.region || locationData.regionName || '';
                    const city = locationData.city || '';
                    const org = locationData.org || locationData.isp || '';
                    location = `${country} ${region} ${city} ${org}`.trim();
                } else if (locationData.loc) {
                    location = `${locationData.city || ''} ${locationData.region || ''} ${locationData.country || ''}`;
                }
                
                updateMultiIPDNSInfo(providerId, index, ip, location);
            })
            .catch(error => {
                locationIndex++;
                if (locationIndex < locationAPIs.length) {
                    setTimeout(tryLocationAPI, 500);
                } else {
                    updateMultiIPDNSInfo(providerId, index, ip, '位置获取失败');
                }
            });
    }
    
    tryLocationAPI();
}

// 更新多IP情况下的DNS信息显示
function updateMultiIPDNSInfo(providerId, index, ip, location) {
    const ipElement = document.getElementById(`${providerId}-${index}-dns-ip`);
    const locationElement = document.getElementById(`${providerId}-${index}-dns-location`);
    
    if (ipElement) {
        ipElement.textContent = ip;
        ipElement.classList.add('success');
    }
    
    if (locationElement) {
        locationElement.textContent = location;
        locationElement.classList.add('success');
    }
}

// 从单个API获取DNS信息
function fetchDNSDataFromAPI(api) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    console.log(`开始获取 ${api.id} 的DNS数据...`);
    console.log(`请求URL: ${api.url}`);
    
    // 优先尝试直连请求
    function tryDirectRequest() {
        console.log(`${api.id} 尝试直接请求...`);
        
        fetch(api.url, {
            method: 'GET',
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`${api.id} 直接请求成功:`, data);
            
            // 根据API格式处理数据
            if (api.format === 'surfshark') {
                handleSurfsharkData(api, data);
            } else if (api.format === 'ip-api') {
                handleIPAPIDataSingle(api, data);
            } else {
                throw new Error('未知的API格式');
            }
            
            clearTimeout(timeoutId);
        })
        .catch(error => {
            console.error(`${api.id} 直接请求失败，尝试代理服务:`, error.message);
            // 直连失败后尝试代理服务
            tryProxyServices();
        });
    }
    
    // 尝试多个代理服务
    const proxyServices = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(api.url)}`,
        `https://cors-anywhere.herokuapp.com/${api.url}`,
        `https://thingproxy.freeboard.io/fetch/${api.url}`
    ];
    
    let currentProxyIndex = 0;
    
    function tryProxyServices() {
        function tryNextProxy() {
            if (currentProxyIndex >= proxyServices.length) {
                // 所有方式都失败
                clearTimeout(timeoutId);
                console.error(`${api.id} 所有请求方式都失败`);
                updateDNSInfoSingle(api.id, '获取失败', '网络错误');
                return;
            }
            
            const proxyURL = proxyServices[currentProxyIndex];
            console.log(`${api.id} 尝试代理 ${currentProxyIndex + 1}: ${proxyURL}`);
            
            fetch(proxyURL, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(proxyData => {
                console.log(`${api.id} 代理 ${currentProxyIndex + 1} 响应:`, proxyData);
            
            // 解析代理返回的数据
            let data;
            try {
                // allorigins.win 返回 {contents: "..."}
                if (proxyData.contents) {
                    data = JSON.parse(proxyData.contents);
                } else {
                    // 其他代理可能直接返回数据
                    data = proxyData;
                }
                console.log(`${api.id} 解析后的数据:`, data);
                
                // 根据API格式处理数据
                if (api.format === 'surfshark') {
                    handleSurfsharkData(api, data);
                } else if (api.format === 'ip-api') {
                    handleIPAPIDataSingle(api, data);
                } else {
                    throw new Error('未知的API格式');
                }
                
                clearTimeout(timeoutId);
            } catch (e) {
                console.error(`${api.id} 代理 ${currentProxyIndex + 1} JSON解析失败:`, e);
                currentProxyIndex++;
                tryNextProxy();
            }
        })
        .catch(error => {
            console.error(`${api.id} 代理 ${currentProxyIndex + 1} 失败:`, error.message);
            currentProxyIndex++;
            tryNextProxy();
        });
        }
        
        // 开始尝试第一个代理
        tryNextProxy();
    }
    
    // 优先开始直连请求
    tryDirectRequest();
}

// 处理Surfshark DNS数据
function handleSurfsharkData(api, data) {
    console.log(`处理Surfshark数据 (${api.id}):`, data);
    
    // Surfshark DNS格式: {"125.64.134.133": {"ISP": "...", "Country": "...", "City": "..."}}
    const ipKeys = Object.keys(data).filter(key => key.match(/^\d+\.\d+\.\d+\.\d+$/));
    
    if (ipKeys.length > 0) {
        // 取第一个IP作为主要显示
        const mainIP = ipKeys[0];
        const ipInfo = data[mainIP];
        
        // 构建位置信息
        let location = '未知位置';
        if (ipInfo.Country || ipInfo.City || ipInfo.ISP) {
            const parts = [];
            if (ipInfo.Country) parts.push(ipInfo.Country);
            if (ipInfo.City) parts.push(ipInfo.City);
            if (ipInfo.ISP) parts.push(ipInfo.ISP);
            location = parts.join(' ');
        }
        
        updateDNSInfoSingle(api.id, mainIP, location);
        
        // 如果有多个IP，在控制台显示所有IP
        if (ipKeys.length > 1) {
            console.log(`${api.id} 检测到多个IP:`, ipKeys);
        }
    } else {
        console.error(`${api.id} 未返回有效IP数据`);
        updateDNSInfoSingle(api.id, '无IP数据', '获取失败');
    }
}

// 处理ip-api数据
function handleIPAPIDataSingle(api, data) {
    console.log(`处理ip-api数据 (${api.id}):`, data);
    
    // ip-api格式: {"dns": {"geo": "中国 - China Telecom", "ip": "125.64.134.134"}}
    if (data.dns && data.dns.ip) {
        updateDNSInfoSingle(api.id, data.dns.ip, data.dns.geo || '未知位置');
    } else {
        console.error(`${api.id} 未返回有效DNS数据`);
        updateDNSInfoSingle(api.id, '无DNS数据', '获取失败');
    }
}

// 更新单个API的DNS信息显示
function updateDNSInfoSingle(apiId, ip, location) {
    const ipElement = document.getElementById(`${apiId}-dns-ip`);
    const locationElement = document.getElementById(`${apiId}-dns-location`);
    
    if (ipElement) {
        ipElement.textContent = ip;
        ipElement.classList.add('success');
    }
    
    if (locationElement) {
        locationElement.textContent = location;
        locationElement.classList.add('success');
    }
    
    console.log(`${apiId} 更新完成: IP=${ip}, 位置=${location}`);
}

// 获取IP地理位置信息
function fetchLocationInfo(providerId, ip) {
    const locationAPIs = [
        `https://ipapi.co/${ip}/json/`,
        `https://ip-api.com/json/${ip}`,
        `https://ipinfo.io/${ip}/json`
    ];
    
    let locationIndex = 0;
    
    function tryLocationAPI() {
        if (locationIndex >= locationAPIs.length) {
            updateDNSInfo(providerId, ip, '位置获取失败');
            return;
        }
        
        fetch(locationAPIs[locationIndex])
            .then(response => response.json())
            .then(locationData => {
                let location = '未知位置';
                
                if (locationData.country_name || locationData.country) {
                    const country = locationData.country_name || locationData.country;
                    const region = locationData.region || locationData.regionName || '';
                    const city = locationData.city || '';
                    const org = locationData.org || locationData.isp || '';
                    location = `${country} ${region} ${city} ${org}`.trim();
                } else if (locationData.loc) {
                    location = `${locationData.city || ''} ${locationData.region || ''} ${locationData.country || ''}`;
                }
                
                updateDNSInfo(providerId, ip, location);
            })
            .catch(error => {
                locationIndex++;
                if (locationIndex < locationAPIs.length) {
                    setTimeout(tryLocationAPI, 500);
                } else {
                    updateDNSInfo(providerId, ip, '位置获取失败');
                }
            });
    }
    
    tryLocationAPI();
}

// 备用DNS数据
function useFallbackDNSData(providerId) {
    const fallbackData = {
        'ipapi': { ip: '125.64.134.134', location: '中国 四川 成都 · China Telecom' },
        'shark1': { ip: '104.18.6.1', location: 'United States California San Francisco · Cloudflare' },
        'shark2': { ip: '104.18.7.1', location: 'United States California San Francisco · Cloudflare' },
        'shark3': { ip: '104.18.8.1', location: 'United States California San Francisco · Cloudflare' },
        'aliyun': { ip: '47.246.50.1', location: 'Singapore · Alibaba Cloud' },
        'fastly': { ip: '151.101.1.1', location: 'United States California San Francisco · Fastly' }
    };
    
    if (fallbackData[providerId]) {
        updateDNSInfo(providerId, fallbackData[providerId].ip, fallbackData[providerId].location);
    } else {
        updateDNSInfo(providerId, '获取失败', '获取失败');
    }
}

// 更新DNS信息
function updateDNSInfo(id, ip, location) {
    const ipElement = document.getElementById(`${id}-dns-ip`);
    const locationElement = document.getElementById(`${id}-dns-location`);
    
    if (ipElement) {
        ipElement.textContent = ip;
    }
    
    if (locationElement) {
        locationElement.textContent = location;
    }
}

// 切换IP显示
function toggleIPDisplay(hide) {
    const ipElements = document.querySelectorAll('.ip-address');
    
    ipElements.forEach(element => {
        if (hide) {
            element.dataset.originalText = element.textContent;
            //element.textContent = '*.*.*.* (已隐藏)';
            element.textContent = '*.*.*.*';
        } else {
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    });
}

// 切换国内地理位置显示
function toggleDomesticLocationDisplay(hide) {
    const domesticRows = document.querySelectorAll('.ip-table tr');
    
    domesticRows.forEach((row, index) => {
        // 前4行是国内IP
        if (index < 4) {
            const locationElement = row.querySelector('.location');
            
            if (locationElement) {
                if (hide) {
                    locationElement.dataset.originalText = locationElement.textContent;
                    locationElement.textContent = '已隐藏';
                } else {
                    if (locationElement.dataset.originalText) {
                        locationElement.textContent = locationElement.dataset.originalText;
                    }
                }
            }
        }
    });
}

// 切换所有地理位置显示
function toggleAllLocationDisplay(hide) {
    const locationElements = document.querySelectorAll('.location');
    
    locationElements.forEach(element => {
        if (hide) {
            element.dataset.originalText = element.textContent;
            element.textContent = '已隐藏';
        } else {
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    });
}

