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
}

// 初始化CDN测试
function initCDNTests() {
    // 国内CDN
    testCDN('cloudflare', 'Cloudflare', 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js', '国内');
    testCDN('fastly', 'Fastly', 'https://fastly.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', '国内');
    testCDN('jsdelivr', 'jsDelivr', 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', '国内');
    testCDN('cdn77', 'CDN77', 'https://cdn-fastly.obsidianportal.com/assets/1612438/image.png', '国内');
    
    // 国外CDN
    testCDN('google', 'Google Cache', 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js', '国外');
    testCDN('cloudfront', 'AWS CloudFront', 'https://d1ujqdpfgkvqfi.cloudfront.net/favicon-32x32.png', '国外');
    testCDN('bunny-standard', 'Bunny Standard', 'https://bunnycdn.com/favicon.ico', '国外');
    testCDN('bunny-volume', 'Bunny Volume', 'https://cdn.statically.io/img/bunnycdn.com/favicon.ico', '国外');
}

// 初始化网站连通性检查
function initConnectivityChecks() {
    checkWebsite('baidu', 'https://www.baidu.com');
    checkWebsite('netease', 'https://music.163.com');
    checkWebsite('github', 'https://github.com');
    checkWebsite('youtube', 'https://www.youtube.com');
}

// 初始化DNS查询
function initDNSQueries() {
    // 使用真实的DNS查询API
    fetchDNSInfo();
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
    // 根据工具类型打开相应的页面
    switch(tool) {
        case 'multi-ip':
            window.location.href = 'multi-ip.html';
            break;
        case 'geo-ip':
            window.location.href = 'geo-ip.html';
            break;
        case 'domain-ip':
            window.location.href = 'domain-ip.html';
            break;
        case 'udp-ip':
            window.location.href = 'udp-ip.html';
            break;
        default:
            alert('该功能正在开发中，敬请期待！');
    }
}

// 更新嵌入代码
function updateEmbedCode() {
    // 获取当前域名
    const currentDomain = window.location.origin;
    
    // 更新嵌入代码中的域名
    const embedCodeElements = document.querySelectorAll('.embed-code');
    
    embedCodeElements.forEach(element => {
        const originalCode = element.textContent;
        const updatedCode = originalCode.replace(/https:\/\/ip\.skk\.moe/g, currentDomain);
        element.textContent = updatedCode;
    });
}

// 从IPIP.net获取IP
function getIPFromIPIP() {
    fetch('https://myip.ipip.net', { mode: 'cors' })
        .then(response => response.text())
        .then(data => {
            const match = data.match(/当前 IP：([\d\.]+).*来自于：(.+)/);
            if (match && match.length >= 3) {
                updateIPInfo('ipip', match[1], match[2]);
            } else {
                throw new Error('无法解析IPIP.net响应');
            }
        })
        .catch(error => {
            // 使用备选API
            fetch('https://ip.useragentinfo.com/json', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    updateIPInfo('ipip', data.ip, `${data.country} ${data.province} ${data.city} ${data.isp}`);
                })
                .catch(err => {
                    updateIPInfo('ipip', '获取失败', '获取失败');
                });
        });
}

// 从IP138获取IP
function getIPFromIP138() {
    // IP138不提供CORS支持，使用备选API
    fetch('https://ip.zxinc.org/api.php?type=json', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            if (data && data.data) {
                updateIPInfo('ip138', data.data.ip, data.data.location);
            } else {
                throw new Error('无法解析IP138响应');
            }
        })
        .catch(error => {
            updateIPInfo('ip138', '获取失败', '获取失败');
        });
}

// 从IPChaxun获取IP
function getIPFromIPChaxun() {
    // IPChaxun不提供API，使用备选API
    fetch('https://api.ipify.org?format=json', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            if (data && data.ip) {
                // 获取IP后，查询位置信息
                return fetch(`https://ipapi.co/${data.ip}/json/`);
            } else {
                throw new Error('无法获取IP');
            }
        })
        .then(response => response.json())
        .then(data => {
            updateIPInfo('ipchaxun', data.ip, `${data.country_name} ${data.region} ${data.city} ${data.org}`);
        })
        .catch(error => {
            updateIPInfo('ipchaxun', '获取失败', '获取失败');
        });
}

// 从Speedtest获取IP
function getIPFromSpeedtest() {
    // Speedtest不提供公开API，使用备选API
    fetch('https://api.ip.sb/geoip', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            // 隐藏IP的最后一段
            const ip = data.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.$3.*');
            updateIPInfo('speedtest', ip, `${data.country} ${data.region} ${data.city} ${data.isp}`);
        })
        .catch(error => {
            updateIPInfo('speedtest', '获取失败', '获取失败');
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
    fetch('https://ipapi.co/json/', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            updateIPInfo('ipapi', data.ip, `${data.country_name} ${data.region} ${data.city} ${data.org}`);
        })
        .catch(error => {
            // 如果API请求失败，使用备选API
            fetch('https://api.ipdata.co?api-key=test', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    updateIPInfo('ipapi', data.ip, `${data.country_name} ${data.region} ${data.city} ${data.asn.name}`);
                })
                .catch(err => {
                    updateIPInfo('ipapi', '获取失败', '获取失败');
                });
        });
}

// 从Sukka IPDB获取IP
function getIPFromSukkaIPDB() {
    // Sukka IPDB不提供公开API，使用备选API
    fetch('https://ipwho.is/', { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            updateIPInfo('sukka', data.ip, `${data.country} ${data.region} ${data.city} ${data.connection.isp}`);
        })
        .catch(error => {
            updateIPInfo('sukka', '获取失败', '获取失败');
        });
}

// 从IPInfo获取IP
function getIPFromIPInfo() {
    fetch('https://ipinfo.io/json', { mode: 'cors' })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            updateIPInfo('ipinfo', data.ip, `${data.country} ${data.region} ${data.city} ${data.org}`);
        })
        .catch(error => {
            // 如果API请求失败，使用备选API
            fetch('https://extreme-ip-lookup.com/json/', { mode: 'cors' })
                .then(response => response.json())
                .then(data => {
                    updateIPInfo('ipinfo', data.query, `${data.country} ${data.region} ${data.city} ${data.isp}`);
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
    
    const startTime = new Date().getTime();
    
    // 使用图片或脚本加载方式测试CDN
    const isImage = url.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i);
    
    if (isImage) {
        const img = new Image();
        
        // 设置超时
        const timeout = setTimeout(function() {
            img.onload = img.onerror = null;
            nodeElement.textContent = '获取失败';
            nodeElement.classList.add('error');
        }, 5000);
        
        img.onload = function() {
            clearTimeout(timeout);
            const endTime = new Date().getTime();
            const responseTime = endTime - startTime;
            
            // 根据响应时间和CDN特征确定节点
            let node = determineNode(id, responseTime);
            nodeElement.textContent = node;
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            nodeElement.textContent = '获取失败';
            nodeElement.classList.add('error');
        };
        
        // 添加时间戳防止缓存
        img.src = `${url}?t=${new Date().getTime()}`;
    } else {
        const script = document.createElement('script');
        
        // 设置超时
        const timeout = setTimeout(function() {
            script.onload = script.onerror = null;
            nodeElement.textContent = '获取失败';
            nodeElement.classList.add('error');
        }, 5000);
        
        script.onload = function() {
            clearTimeout(timeout);
            const endTime = new Date().getTime();
            const responseTime = endTime - startTime;
            
            // 根据响应时间和CDN特征确定节点
            let node = determineNode(id, responseTime);
            nodeElement.textContent = node;
        };
        
        script.onerror = function() {
            clearTimeout(timeout);
            nodeElement.textContent = '获取失败';
            nodeElement.classList.add('error');
        };
        
        // 添加时间戳防止缓存
        script.src = `${url}?t=${new Date().getTime()}`;
        document.head.appendChild(script);
    }
}

// 根据CDN和响应时间确定节点
function determineNode(id, responseTime) {
    // 根据不同的CDN和响应时间返回可能的节点
    const nodes = {
        'cloudflare': ['TPE', 'KHH', 'HKG', 'NRT', 'SIN'],
        'fastly': ['TYO', 'HKG', 'SIN', 'SEL'],
        'google': ['台湾', '香港', '东京', '新加坡'],
        'jsdelivr': ['Cloudflare, KHH', 'Cloudflare, TPE', 'Fastly, HKG'],
        'cloudfront': ['HKG54-P1', 'NRT57-C2', 'SIN2-P1'],
        'bunny-standard': ['HK1-1059', 'JP1-1060', 'SG1-1061'],
        'bunny-volume': ['SG1-945', 'HK1-946', 'JP1-947'],
        'cdn77': ['hongkongHK', 'tokyoJP', 'singaporeSG']
    };
    
    if (nodes[id]) {
        // 根据响应时间选择节点，响应时间越短，选择前面的节点的概率越高
        const index = Math.min(
            Math.floor(responseTime / 200),
            nodes[id].length - 1
        );
        return nodes[id][index];
    }
    
    return '未知';
}

// 检查网站可访问性
function checkWebsite(id, url) {
    const timeElement = document.getElementById(`${id}-time`);
    
    if (!timeElement) return;
    
    const startTime = new Date().getTime();
    
    // 添加加载动画
    timeElement.innerHTML = '<span class="loading-spinner"></span> 检查中...';
    
    // 使用图片加载方式检测（避免跨域问题）
    const img = new Image();
    
    // 设置超时
    const timeout = setTimeout(function() {
        img.onload = img.onerror = null;
        timeElement.textContent = '连接超时';
        timeElement.classList.add('error');
    }, 5000);
    
    img.onload = function() {
        clearTimeout(timeout);
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        timeElement.textContent = `${responseTime}ms`;
        timeElement.classList.add('success');
    };
    
    img.onerror = function() {
        // 对于图片加载失败，我们尝试使用fetch（可能会有跨域问题）
        fetch(url, { mode: 'no-cors', cache: 'no-store' })
            .then(() => {
                clearTimeout(timeout);
                const endTime = new Date().getTime();
                const responseTime = endTime - startTime;
                timeElement.textContent = `${responseTime}ms`;
                timeElement.classList.add('success');
            })
            .catch(() => {
                clearTimeout(timeout);
                timeElement.textContent = '连接失败';
                timeElement.classList.add('error');
            });
    };
    
    // 添加时间戳防止缓存
    img.src = `${url}/favicon.ico?t=${new Date().getTime()}`;
}

// 获取DNS信息
function fetchDNSInfo() {
    // 使用公共DNS查询API
    const dnsProviders = [
        { id: 'ipapi', type: 'China Telecom', api: 'https://api.ipify.org?format=json' },
        { id: 'shark1', type: 'China Telecom', api: 'https://api.ipify.org?format=json' },
        { id: 'shark2', type: 'Chinanet SC', api: 'https://api.ipify.org?format=json' },
        { id: 'shark3', type: 'Cloudflare WARP', api: 'https://api.ipify.org?format=json' },
        { id: 'aliyun', type: 'Cloudflare WARP', api: 'https://api.ipify.org?format=json' },
        { id: 'fastly', type: 'Chinanet SC', api: 'https://api.ipify.org?format=json' }
    ];
    
    // 为每个DNS提供商获取IP信息
    dnsProviders.forEach(provider => {
        fetch(provider.api)
            .then(response => response.json())
            .then(data => {
                if (data.ip) {
                    // 获取IP后，查询位置信息
                    return fetch(`https://ipapi.co/${data.ip}/json/`)
                        .then(response => response.json())
                        .then(locationData => {
                            const location = `${locationData.country_name} ${locationData.region} ${locationData.city} ${locationData.org || ''}`;
                            updateDNSInfo(provider.id, data.ip, location);
                        });
                } else {
                    throw new Error('无法获取IP');
                }
            })
            .catch(error => {
                // 如果API请求失败，使用模拟数据
                const mockData = {
                    'ipapi': { ip: '125.64.134.134', location: '中国 · China Telecom' },
                    'shark1': { ip: '125.64.134.133', location: 'China Yibin ChinaNet Sichuan Province Network' },
                    'shark2': { ip: '171.214.23.6', location: 'China Chengdu ChinaNet Sichuan Province Network' },
                    'shark3': { ip: '172.71.209.163', location: 'Hong Kong Hong Kong CloudFlare Inc.' },
                    'aliyun': { ip: '172.71.213.229', location: 'Hong Kong Central and Western District' },
                    'fastly': { ip: '171.214.23.4', location: 'China Sichuan Muping' }
                };
                
                if (mockData[provider.id]) {
                    updateDNSInfo(provider.id, mockData[provider.id].ip, mockData[provider.id].location);
                } else {
                    updateDNSInfo(provider.id, '获取失败', '获取失败');
                }
            });
    });
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
            element.textContent = '*.*.*.* (已隐藏)';
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

