window.addEventListener('DOMContentLoaded', (event) => {
    // --- Initialize Mermaid (must be done before rendering) ---
    mermaid.initialize({
        startOnLoad: false, // We will call render manually
        theme: 'default', // Or 'neutral', 'dark', 'forest'
        // securityLevel: 'loose' // Use if you encounter issues with complex diagrams or external resources
    });

    // --- Initialize markdown-it ---
    const md = window.markdownit({
        html: true,        // Enable HTML tags in source
        xhtmlOut: false,     // Use '/' to close single tags (<br />)
        breaks: true,      // Convert '\n' in paragraphs into <br>
        langPrefix: 'language-', // CSS language prefix for fenced blocks
        linkify: true,       // Autoconvert URL-like text to links
        typographer: true,   // Enable smartypants-style substitutions
        // Code highlighting function using highlight.js
        highlight: function (str, lang) {
            // Special handling for Mermaid
            if (lang === 'mermaid') {
                // Return a div that Mermaid can find and render
                // Ensure the content is properly escaped in case it contains HTML-like syntax
                const escapedStr = md.utils.escapeHtml(str);
                // Unique ID generation helps if multiple diagrams exist
                const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
                // We'll store the raw code in a data attribute for mermaid.run later
                return `<div class="mermaid" data-mermaid-code="${escapedStr}" id="${uniqueId}">${escapedStr}</div>`;
            }

            // Standard highlighting
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                           hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                           '</code></pre>';
                } catch (__) {}
            }

            // Fallback: escape HTML and wrap in <pre><code>
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });

    // --- Initialize CodeMirror ---
    const editorElement = document.getElementById('editor');
    const previewElement = document.getElementById('preview');

    const editor = CodeMirror.fromTextArea(editorElement, {
        mode: 'markdown',
        theme: 'material-darker', // Match the CSS theme link
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
    });

    // --- Initial Content ---
    const initialContent = `# 静态 Markdown 编辑器

这是一个使用 HTML, CSS, 和纯 JavaScript (通过 CDN 加载库) 构建的编辑器。

## 特性

*   实时预览
*   **GitHub 风格** Markdown 渲染
*   代码语法高亮 (via \`highlight.js\`)
*   数学公式 (via \`KaTeX\`)
    *   Inline: $E = mc^2$
    *   Block: $$ \sum_{i=1}^n i = \frac{n(n+1)}{2} $$
*   流程图 & 图表 (via \`Mermaid\`)
    \`\`\`mermaid
    graph TD;
        A[开始] --> B{检查输入?};
        B -- 是 --> C[处理];
        B -- 否 --> D[结束];
        C --> D;
    \`\`\`
*   导出功能 (MD, HTML, PNG, PDF)

## 示例代码块

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

---
Enjoy!
`;
    editor.setValue(initialContent);

    // --- Render Preview Function ---
    let mermaidRenderPending = false; // Flag to prevent multiple simultaneous runs
    let renderTimeout; // For debouncing

    function renderPreview() {
        const markdownText = editor.getValue();

        // 1. Render Markdown to HTML using markdown-it
        let html = md.render(markdownText);

        // 2. Post-process for KaTeX
        // Needs careful regex to avoid conflicts and errors
        try {
            html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, expression) => {
                try {
                    return katex.renderToString(expression.trim(), { displayMode: true, throwOnError: false });
                } catch (e) {
                    console.error("KaTeX Block Error:", e);
                    return `<span style="color:red;" title="${e.message}">[KaTeX Block Error]</span>`;
                }
            });
            html = html.replace(/(?<!\$)\$(?!\$)([\s\S]*?)(?<!\$)\$/g, (match, expression) => {
                 // More robust inline check: avoid $$ delimiters and ensure $ is not escaped
                if (expression.trim()) { // Only render if there's content
                    try {
                        return katex.renderToString(expression.trim(), { displayMode: false, throwOnError: false });
                    } catch (e) {
                        console.error("KaTeX Inline Error:", e);
                        return `<span style="color:red;" title="${e.message}">[KaTeX Inline Error]</span>`;
                    }
                }
                return match; // Return original if empty or invalid
            });
        } catch(e) {
            console.error("KaTeX Regex/Global Error:", e);
        }


        // 3. Update preview pane's HTML
        previewElement.innerHTML = html;

        // 4. Trigger Mermaid rendering (async)
        // Use a flag and setTimeout to prevent issues if updates are rapid
        if (!mermaidRenderPending) {
            mermaidRenderPending = true;
            setTimeout(async () => {
                try {
                    const mermaidDivs = previewElement.querySelectorAll('div.mermaid');
                    if (mermaidDivs.length > 0) {
                       // New Mermaid API prefers mermaid.run()
                       await mermaid.run({ nodes: mermaidDivs });
                       // console.log(`Mermaid rendered ${mermaidDivs.length} diagrams.`);
                    }
                } catch (e) {
                    console.error("Mermaid Rendering Error:", e);
                     // Display error in the preview pane itself
                    previewElement.querySelectorAll('div.mermaid').forEach(div => {
                        if (!div.querySelector('svg')) { // If mermaid failed to render svg
                             div.innerHTML = `<pre style="color: red;">Mermaid Error:\n${e.message || e}\nCode:\n${div.getAttribute('data-mermaid-code') || div.textContent}</pre>`;
                        }
                    });
                } finally {
                     mermaidRenderPending = false;
                }
            }, 100); // Small delay allows DOM update
        }
    }

     // --- Debounce Editor Changes ---
    editor.on('change', () => {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(renderPreview, 250); // Render 250ms after last change
    });

    // --- Initial Render ---
    renderPreview();

    // --- Helper: Download File ---
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    // --- Export Button Listeners ---
    document.getElementById('export-md').addEventListener('click', () => {
        const content = editor.getValue();
        downloadFile('document.md', content, 'text/markdown;charset=utf-8');
    });

    document.getElementById('export-html').addEventListener('click', () => {
        // Include necessary CSS and potentially JS for standalone viewing
        const previewContent = previewElement.innerHTML;
        const styles = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
            <style>
                /* Embed essential CSS from style.css (especially .markdown-body rules) */
                body { font-family: sans-serif; margin: 20px; }
                .markdown-body { line-height: 1.7; color: #24292e; }
                /* Copy ALL .markdown-body rules from style.css here */
                .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                .markdown-body h1 { font-size: 2em; } .markdown-body h2 { font-size: 1.5em; }
                .markdown-body code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; font-family: monospace; }
                .markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 3px; }
                .markdown-body pre code { padding: 0; margin: 0; font-size: 100%; background: transparent; border: 0; }
                .markdown-body blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 0 0 16px 0; }
                .markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 2em; }
                .markdown-body img { max-width: 100%; }
                .markdown-body table { border-collapse: collapse; margin-bottom: 16px; border: 1px solid #dfe2e5; }
                .markdown-body th, .markdown-body td { padding: 6px 13px; border: 1px solid #dfe2e5; }
                .markdown-body th { font-weight: 600; background-color: #f6f8fa; }
                .katex-display { display: block; margin: 1em 0; text-align: center; }
                .mermaid { text-align: center; margin-bottom: 16px; }
                .hljs { display: block; overflow-x: auto; padding: 0.5em; background: #f6f8fa; color: #24292e; }
                /* Add other styles as needed */
            </style>
        `;
        // NOTE: Exported HTML won't re-render Mermaid unless Mermaid JS is included and run.
        // A better approach for HTML export might be to convert Mermaid to SVG *before* exporting.
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Document</title>
    ${styles}
    <!-- To render Mermaid diagrams in the exported file, include Mermaid library and initialization -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script> -->
    <!-- <script>mermaid.initialize({startOnLoad: true, theme: 'default'});<\/script> -->
</head>
<body class="markdown-body">
    ${previewContent}
</body>
</html>`;
        downloadFile('document.html', fullHtml, 'text/html;charset=utf-8');
    });

    document.getElementById('export-png').addEventListener('click', () => {
        console.log("Attempting PNG export...");
        const targetElement = previewElement;
        html2canvas(targetElement, {
             useCORS: true, // Important for external images, if any
             logging: true,
             scale: window.devicePixelRatio * 2, // Increase scale for better resolution
             backgroundColor: '#ffffff', // Explicitly set background
             onclone: (clonedDoc) => {
                // Attempt to ensure styles are fully applied in the clone
                const clonedTarget = clonedDoc.getElementById('preview');
                if (clonedTarget) {
                    clonedTarget.style.width = `${targetElement.scrollWidth}px`;
                    clonedTarget.style.height = `${targetElement.scrollHeight}px`;
                    console.log(`Cloned dimensions: ${targetElement.scrollWidth} x ${targetElement.scrollHeight}`);
                }
             }
        }).then(canvas => {
            console.log("Canvas generated");
            const dataUrl = canvas.toDataURL('image/png');
            downloadFile('document.png', dataUrl, 'image/png'); // Pass dataUrl directly works for modern browser download triggers
            // If direct download fails, use the link method:
            // const a = document.createElement('a');
            // a.href = dataUrl;
            // a.download = 'document.png';
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            console.log("PNG download triggered.");
        }).catch(err => {
            console.error("导出 PNG 失败:", err);
            alert(`导出 PNG 失败: ${err.message}\n请检查浏览器控制台获取详细信息。\n提示：复杂内容、外部资源或浏览器限制可能导致失败。`);
        });
    });

    document.getElementById('export-pdf').addEventListener('click', () => {
        alert("注意：客户端 PDF 导出是实验性的，可能无法完美处理分页、复杂布局或矢量图。\n推荐使用浏览器打印功能（选择 '另存为PDF'）以获得更好效果。");
        console.log("Attempting PDF export...");
        const { jsPDF } = window.jspdf;
        const targetElement = previewElement;

        html2canvas(targetElement, {
            useCORS: true,
            logging: true,
            scale: window.devicePixelRatio * 2, // Higher scale for better PDF quality
            backgroundColor: '#ffffff',
             onclone: (clonedDoc) => {
                const clonedTarget = clonedDoc.getElementById('preview');
                 if (clonedTarget) {
                    // Try setting explicit dimensions of the content for html2canvas
                    clonedTarget.style.width = `${targetElement.scrollWidth}px`;
                    clonedTarget.style.height = `${targetElement.scrollHeight}px`;
                 }
             }
        }).then(canvas => {
            console.log("Canvas generated for PDF");
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG for smaller PDF size, adjust quality
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Calculate the aspect ratio
            const ratio = canvasWidth / canvasHeight;
            const pdfImageWidth = pdfWidth - 40; // A4 width in points, with margin
            let pdfImageHeight = pdfImageWidth / ratio;
            let position = 20; // Top margin

            // Basic pagination (splits image, not content-aware)
            let heightLeft = canvasHeight * (pdfImageWidth / canvasWidth); // Total scaled height

            if (heightLeft <= pdfHeight - 40) { // Fits on one page
                 pdf.addImage(imgData, 'JPEG', 20, position, pdfImageWidth, pdfImageHeight);
            } else {
                 console.warn("Content exceeds one PDF page. Implementing basic image splitting.");
                 let pageCanvas = document.createElement('canvas');
                 let pageCtx = pageCanvas.getContext('2d');
                 // A4 aspect ratio approx 1.414
                 let sourcePageHeight = Math.floor(canvasWidth * 1.414); // How much canvas height fits on one PDF page (approx)

                 let sourceY = 0;
                 while (sourceY < canvasHeight) {
                      let sourceHeight = Math.min(sourcePageHeight, canvasHeight - sourceY);
                      pageCanvas.width = canvasWidth;
                      pageCanvas.height = sourceHeight;

                      pageCtx.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight);
                      let pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);

                      let pageImgHeight = sourceHeight * (pdfImageWidth/canvasWidth);

                      pdf.addImage(pageImgData, 'JPEG', 20, position, pdfImageWidth, pageImgHeight);

                      sourceY += sourceHeight;
                       if (sourceY < canvasHeight) {
                          pdf.addPage();
                          position = 20; // Reset top margin for new page
                       }
                 }
                 pageCanvas = null; // Clean up
            }


            pdf.save('document.pdf');
            console.log("PDF download triggered.");
        }).catch(err => {
             console.error("导出 PDF 失败:", err);
             alert(`导出 PDF 失败: ${err.message}\n请检查浏览器控制台获取详细信息。\n提示：内容过长或过复杂可能导致内存不足或渲染错误。`);
        });
    });

}); // End DOMContentLoaded