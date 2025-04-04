/**
 * 导出工具函数集合
 * 提供多种格式的导出功能：Markdown、PDF、图片和HTML
 */

const exportUtils = {
    /**
     * 导出为Markdown文件
     * @param {string} content - Markdown内容
     * @param {string} filename - 文件名（不含扩展名）
     */
    exportMarkdown: function(content, filename = 'document') {
        const blob = new Blob([content], { type: 'text/markdown' });
        this.downloadBlob(blob, `${filename}.md`);
    },

    /**
     * 导出为HTML文件
     * @param {string} content - HTML内容
     * @param {string} filename - 文件名（不含扩展名）
     */
    exportHTML: function(content, filename = 'document') {
        // 添加基本的HTML结构和样式
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background-color: #f6f8fa;
            padding: 15px;
            border-radius: 3px;
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            background-color: #f6f8fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        blockquote {
            border-left: 5px solid #eee;
            padding-left: 15px;
            color: #666;
        }
        img {
            max-width: 100%;
        }
        .mermaid {
            text-align: center;
        }
    </style>
    <!-- 添加必要的库以支持数学公式和Mermaid图表 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.2.4/mermaid.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/contrib/auto-render.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.css">
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化Mermaid，配置更多图表类型支持
            mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                flowchart: { useMaxWidth: true },
                sequence: { useMaxWidth: true },
                gantt: { useMaxWidth: true },
                journey: { useMaxWidth: true },
                pie: { useMaxWidth: true },
                mindmap: { useMaxWidth: true },
                themeVariables: {
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }
            });
            
            // 渲染数学公式
            renderMathInElement(document.body, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ],
                throwOnError: false
            });
        });
    </script>
</head>
<body>
    ${content}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.downloadBlob(blob, `${filename}.html`);
    },

    /**
     * 导出为PDF文件
     * @param {HTMLElement} element - 要导出为PDF的DOM元素
     * @param {string} filename - 文件名（不含扩展名）
     */
    exportPDF: function(element, filename = 'document') {
        // 使用html2pdf库将HTML内容转换为PDF
        // 注意：这需要在页面中引入html2pdf.js库
        if (typeof html2pdf === 'undefined') {
            console.error('html2pdf库未加载，无法导出PDF');
            alert('导出PDF功能需要加载html2pdf库，请检查网络连接或刷新页面重试。');
            return;
        }

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 执行PDF导出
        html2pdf().set(opt).from(element).save();
    },

    /**
     * 导出为图片（PNG格式）
     * @param {HTMLElement} element - 要导出为图片的DOM元素
     * @param {string} filename - 文件名（不含扩展名）
     */
    exportImage: function(element, filename = 'document') {
        // 使用html2canvas库将HTML内容转换为图片
        // 注意：这需要在页面中引入html2canvas库
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas库未加载，无法导出图片');
            alert('导出图片功能需要加载html2canvas库，请检查网络连接或刷新页面重试。');
            return;
        }

        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        }).then(canvas => {
            // 转换为图片并下载
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `${filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(error => {
            console.error('导出图片失败:', error);
            alert('导出图片失败，请检查控制台获取详细错误信息。');
        });
    },

    /**
     * 通用的Blob下载函数
     * @param {Blob} blob - 要下载的Blob对象
     * @param {string} filename - 下载的文件名
     */
    downloadBlob: function(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// 导出工具对象供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportUtils;
}