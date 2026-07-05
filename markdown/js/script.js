window.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM Loaded. Initializing editor...");

    // --- Global Elements ---
    const editorElement = document.getElementById('editor');
    const previewElement = document.getElementById('preview');
    const editorPane = document.getElementById('editor-pane');
    const tocModal = document.getElementById('toc-modal');
    const tocListContainer = document.getElementById('toc-list-container');
    const tocCloseButton = tocModal?.querySelector('.modal-close-button');
    const tocButton = document.getElementById('btn-toc');
    const headerElement = document.querySelector('.main-header'); // Get header for height calculation

    if (!editorElement || !previewElement || !editorPane) {
        console.error("Essential editor elements not found!");
        return; // Stop execution if critical elements are missing
    }

    // --- Initialize Mermaid ---
    try {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            // securityLevel: 'loose' // Uncomment if complex diagrams fail
        });
    } catch (e) {
        console.error("Mermaid initialization failed:", e);
    }


    // --- Initialize markdown-it ---
    const md = window.markdownit({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
            // Mermaid specific handling
            if (lang === 'mermaid') {
                try {
                    // No need to parse here, just wrap for Mermaid library
                    // Ensure content is escaped if it might contain HTML chars misinterpreted by browser
                     const escapedStr = md.utils.escapeHtml(str);
                    return `<div class="mermaid">${escapedStr}</div>`;
                } catch (e) {
                     console.error("Error processing Mermaid block for wrapper:", e)
                     return `<pre class="mermaid-error">Error preparing Mermaid block: ${e.message}</pre>`;
                }
            }

            // ECharts specific handling
            if (lang === 'echarts') {
                try {
                    // Use a unique ID and store the raw JSON in a script tag to avoid attribute quoting issues
                    const chartId = 'echarts-' + Math.random().toString(36).substr(2, 9);
                    return `<div class="echarts-container" id="${chartId}" style="width:100%;height:400px;margin:16px 0;"></div><script type="application/json" class="echarts-data" data-target="${chartId}">${md.utils.escapeHtml(str)}<\/script>`;
                } catch (e) {
                    console.error("Error processing ECharts block:", e);
                    return `<pre class="echarts-error" style="color:red;border:1px solid red;padding:10px;">ECharts Error: ${md.utils.escapeHtml(e.message)}</pre>`;
                }
            }

            // Standard highlighting
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                           hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                           '</code></pre>';
                } catch (e) {
                    console.error(`Highlight.js error for lang ${lang}:`, e);
                }
            }

            // Fallback for unrecognised languages or errors
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });


    // --- Initialize CodeMirror ---
    let editor;
    try {
        editor = CodeMirror.fromTextArea(editorElement, {
            mode: 'markdown',
            theme: 'material-darker',
            lineNumbers: true,
            lineWrapping: true,
            autofocus: true,
            // Add keymaps if needed, e.g., for Tab indentation
            extraKeys: {
                 "Tab": function(cm) {
                      cm.replaceSelection("  ", "end"); // Example: Insert 2 spaces for Tab
                 }
                 // Add Ctrl+B, Ctrl+I etc. if desired, mapping to button clicks
                 // "Ctrl-B": () => document.getElementById('btn-bold')?.click(),
                 // "Ctrl-I": () => document.getElementById('btn-italic')?.click(),
                 // "Ctrl-L": () => document.getElementById('btn-link')?.click(),
             }
        });
    } catch(e) {
        console.error("CodeMirror initialization failed:", e);
        editorPane.innerHTML = "<p style='color:red; padding: 15px;'>Error initializing code editor. Check console.</p>";
        return; // Stop if editor fails
    }


    // --- Dynamic Height Adjustment ---
    function adjustEditorHeight() {
        const headerHeight = headerElement ? headerElement.offsetHeight : 84; // Use measured or fallback
        const newHeight = `calc(100vh - ${headerHeight}px)`;
        const container = document.querySelector('.editor-container');
        if (container) {
            container.style.height = newHeight;
        }
        // Refresh codemirror layout if necessary after potential resize
        if (editor) editor.refresh();
    }
    // Adjust height initially and on window resize
    adjustEditorHeight();
    window.addEventListener('resize', () => {
        adjustEditorHeight();
        // Resize all ECharts instances on window resize
        if (typeof echarts !== 'undefined' && previewElement) {
            previewElement.querySelectorAll('.echarts-container').forEach(container => {
                const chart = echarts.getInstanceByDom(container);
                if (chart) chart.resize();
            });
        }
    });


    // --- Load Initial Content from introduce.md ---
    async function loadIntroduceContent() {
        const INTRODUCE_FILE = 'introduce.md';
        const FALLBACK_CONTENT = '# Markdown 编辑器\n\n欢迎使用！请开始编写您的 Markdown 内容。';
        
        try {
            const response = await fetch(INTRODUCE_FILE);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            if (editor && content.trim()) {
                editor.setValue(content);
                console.log(`Successfully loaded ${INTRODUCE_FILE}`);
                return;
            }
        } catch (error) {
            console.warn(`Failed to load ${INTRODUCE_FILE}:`, error.message);
        }
        
        // Fallback to simple default content
        if (editor) {
            editor.setValue(FALLBACK_CONTENT);
            console.log('Using fallback content');
        }
    }
    
    // Load content after editor is initialized
    loadIntroduceContent();

    // --- Render Preview Logic ---
    let mermaidRenderPending = false;
    let renderTimeout;

    function renderPreview() {
        if (!editor || !previewElement) return; // Guard against missing elements

        const markdownText = editor.getValue();

        // 1. Render Markdown to HTML
        let html = "";
        try {
             html = md.render(markdownText);
        } catch (e) {
            console.error("Markdown-it rendering error:", e);
            previewElement.innerHTML = `<p style="color:red;">Error rendering Markdown. Check console.</p>`;
            return;
        }


        // 2. Post-process for KaTeX (避免在代码块内渲染)
        try {
            // 创建一个临时DOM来解析HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // 获取所有代码块元素
            const codeBlocks = tempDiv.querySelectorAll('pre code, code');
            const codeBlockContents = [];
            const placeholders = [];
            
            // 保存代码块内容并用占位符替换
            codeBlocks.forEach((block, index) => {
                const placeholder = `__CODE_BLOCK_${index}__`;
                codeBlockContents.push(block.innerHTML);
                placeholders.push(placeholder);
                block.innerHTML = placeholder;
            });
            
            // 获取处理后的HTML
            let processedHtml = tempDiv.innerHTML;
            
            // Block Mode $$...$$
            processedHtml = processedHtml.replace(/\$\$([\s\S]*?)\$\$/g, (match, expression) => {
                try {
                    // 清理表达式中的<br>标签和HTML实体
                    let cleanExpression = expression.trim()
                        .replace(/<br\s*\/?>/gi, '')
                        .replace(/&lt;br\s*\/?&gt;/gi, '')
                        .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '')
                        .replace(/\s+/g, ' ');
                    if (!cleanExpression) return match;
                    return katex.renderToString(cleanExpression, { displayMode: true, throwOnError: true, output: "html" });
                } catch (e) {
                    console.warn("KaTeX Block Error:", e.message, "Input:", expression);
                    return `<div class="katex-error" title="${md.utils.escapeHtml(e.toString())}">[KaTeX Block Error]<br>${md.utils.escapeHtml(e.message)}</div>`;
                }
            });

            // Inline Mode $...$ (Refined Regex)
            processedHtml = processedHtml.replace(/(?<!\\|\$)\$((?:\\.|[^\$\\])+)\$(?!\$)/g, (match, expression) => {
                try {
                    // 清理表达式中的<br>标签和HTML实体
                    let cleanExpression = expression.trim()
                        .replace(/<br\s*\/?>/gi, '')
                        .replace(/&lt;br\s*\/?&gt;/gi, '')
                        .replace(/&lt;\s*br\s*\/?\s*&gt;/gi, '')
                        .replace(/\s+/g, ' ');
                    if (!cleanExpression) return match;
                    const finalExpression = cleanExpression.replace(/\\\$/g, '$');
                    return katex.renderToString(finalExpression, { displayMode: false, throwOnError: true, output: "html" });
                } catch (e) {
                    console.warn("KaTeX Inline Error:", e.message, "Input:", expression);
                    return `<span class="katex-error" title="${md.utils.escapeHtml(e.toString())}">[KaTeX Inline Error]</span>`;
                }
            });
            
            // 恢复代码块内容
            placeholders.forEach((placeholder, index) => {
                processedHtml = processedHtml.replace(placeholder, codeBlockContents[index]);
            });
            
            html = processedHtml;
        } catch(e) {
            console.error("KaTeX Global Error during processing:", e);
        }


        // 3. Update preview pane's HTML
        previewElement.innerHTML = html;


        // 4. Trigger Mermaid rendering (Async + Flag)
        const mermaidBlocks = previewElement.querySelectorAll('div.mermaid');
        if (mermaidBlocks.length > 0 && !mermaidRenderPending) {
            mermaidRenderPending = true;
            // Use requestAnimationFrame for potentially smoother rendering start
            requestAnimationFrame(async () => {
                try {
                     console.log(`Rendering ${mermaidBlocks.length} Mermaid diagram(s)...`);
                     // It's crucial Mermaid is initialized before run is called
                     await mermaid.run({ nodes: mermaidBlocks });
                     console.log("Mermaid rendering finished.");
                } catch (e) {
                    console.error("Mermaid Rendering Error:", e);
                    // Add error message to the specific block that failed
                    mermaidBlocks.forEach(div => {
                        // Check if the div *still* doesn't have an SVG after the run attempt
                        if (!div.querySelector('svg') && !div.querySelector('.mermaid-error-msg')) {
                            div.innerHTML = `<pre class="mermaid-error-msg" style="color: red; border: 1px solid red; padding: 10px; font-size: 12px; text-align: left;">Mermaid Error:\n${e.message || e}\n--- Code ---\n${div.textContent || '[Could not retrieve code]'}</pre>`;
                        }
                    });
                } finally {
                    mermaidRenderPending = false;
                }
            });
        }

        // 5. Trigger ECharts rendering
        const echartsDataScripts = previewElement.querySelectorAll('script.echarts-data[data-target]');
        if (echartsDataScripts.length > 0 && typeof echarts !== 'undefined') {
            echartsDataScripts.forEach((script, index) => {
                try {
                    const targetId = script.getAttribute('data-target');
                    const container = previewElement.querySelector('#' + targetId);
                    if (!container) {
                        console.warn(`ECharts container #${targetId} not found`);
                        return;
                    }
                    
                    // Decode the HTML-escaped JSON from the script tag
                    const optionText = script.textContent
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#39;/g, "'");
                    
                    const option = JSON.parse(optionText);
                    
                    // Dispose existing chart instance if any (prevents memory leak on re-render)
                    const existingChart = echarts.getInstanceByDom(container);
                    if (existingChart) {
                        existingChart.dispose();
                    }
                    
                    const chart = echarts.init(container);
                    chart.setOption(option);
                    
                    // Remove the script tag to prevent re-processing
                    script.remove();
                    
                    console.log(`ECharts diagram ${index + 1} rendered successfully.`);
                } catch (e) {
                    console.error(`ECharts rendering error for block ${index + 1}:`, e);
                    const targetId = script.getAttribute('data-target');
                    const container = previewElement.querySelector('#' + targetId);
                    if (container) {
                        container.innerHTML = `<pre style="color:red;border:1px solid red;padding:10px;font-size:12px;text-align:left;">ECharts Error:\n${e.message}\n\nPlease ensure the option is valid JSON.</pre>`;
                    }
                }
            });
        }
    }

    // --- Debounce Editor Changes ---
    if (editor) {
        editor.on('change', () => {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(renderPreview, 250); // Render 250ms after last change
        });
    }

    // --- Initial Render ---
    renderPreview();
    console.log("Initial render triggered.");

    // --- Dropdown Menu Logic ---
    function closeAllDropdowns(exceptMenu = null) {
        document.querySelectorAll('.dropdown-menu.show').forEach(openMenu => {
            if (openMenu !== exceptMenu) {
                openMenu.classList.remove('show');
            }
        });
    }

    document.querySelectorAll('.dropdown-container').forEach(container => {
        const button = container.querySelector('button'); // Targets the button directly inside
        const menu = container.querySelector('.dropdown-menu');

        if (button && menu) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCurrentlyShown = menu.classList.contains('show');
                closeAllDropdowns(); // Close others first
                if (!isCurrentlyShown) {
                    menu.classList.add('show'); // Then show current if it wasn't already
                }
            });
        }
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            closeAllDropdowns();
        }
    });

    // --- CodeMirror Helper Functions ---
    function insertText(text) {
        if (!editor) return;
        editor.replaceSelection(text);
        editor.focus();
    }

    function wrapSelection(before, after = before) {
        if (!editor) return;
        const selection = editor.getSelection();
        if (selection) {
            editor.replaceSelection(before + selection + after);
        } else {
            const cursor = editor.getCursor();
            editor.replaceSelection(before + after);
            editor.setCursor(cursor.line, cursor.ch + before.length);
        }
        editor.focus();
    }

    // --- Toolbar Button Actions ---
    document.getElementById('btn-bold')?.addEventListener('click', () => wrapSelection('**'));
    document.getElementById('btn-italic')?.addEventListener('click', () => wrapSelection('*'));
    document.getElementById('btn-strikethrough')?.addEventListener('click', () => wrapSelection('~~'));
    document.getElementById('btn-quote')?.addEventListener('click', () => {
        if (!editor) return;
        const cursor = editor.getCursor();
        const lineContent = editor.getLine(cursor.line);
        // Check if line already starts with '> ' to avoid adding multiple times easily
        if (/^\s*>\s*/.test(lineContent)) {
            // Optionally, implement toggling off the quote here
            editor.replaceRange(lineContent.replace(/^\s*>\s*/, ''), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: lineContent.length });
        } else {
            editor.replaceRange('> ' + lineContent, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: lineContent.length });
            editor.setCursor(cursor.line, cursor.ch + 2);
        }
        editor.focus();
    });
    document.getElementById('btn-code')?.addEventListener('click', () => wrapSelection('`'));
    document.getElementById('btn-code-block')?.addEventListener('click', () => wrapSelection('\n```\n', '\n```\n'));
    document.getElementById('btn-ul')?.addEventListener('click', () => insertText('- '));
    document.getElementById('btn-ol')?.addEventListener('click', () => insertText('1. '));
    document.getElementById('btn-link')?.addEventListener('click', () => {
        if (!editor) return;
        const selection = editor.getSelection();
        wrapSelection('[', `](${selection || 'url'})`);
        // TODO: Select the 'url' part for easy editing
    });
    document.getElementById('btn-table')?.addEventListener('click', () => {
        insertText(
            '\n| Header 1 | Header 2 |\n' +
            '| :------- | :------- |\n' + // Added alignment syntax
            '| Cell 1   | Cell 2   |\n' +
            '| Cell 3   | Cell 4   |\n'
        );
    });

    // Formula Insertion
    document.getElementById('insert-inline-formula')?.addEventListener('click', (e) => { e.preventDefault(); wrapSelection('$', '$'); closeAllDropdowns(); });
    document.getElementById('insert-block-formula')?.addEventListener('click', (e) => { e.preventDefault(); wrapSelection('\n$$\n', '\n$$\n'); closeAllDropdowns(); });

    // Mermaid Insertion
    document.querySelectorAll('.mermaid-menu a')?.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.target.dataset.mermaidType;
            let template = '';
            // Simplified templates - users will need to edit extensively
            switch (type) {
                case 'graph': template = 'graph TD;\n    A-->B;'; break;
                case 'sequenceDiagram': template = 'sequenceDiagram\n    participant User\n    participant System\n    User->>System: Request'; break;
                case 'classDiagram': template = 'classDiagram\n    class BankAccount{\n      +String owner\n      +Float balance\n      +deposit(amount)\n    }'; break;
                case 'stateDiagram': template = 'stateDiagram-v2\n    [*] --> Idle\n    Idle --> Processing : event\n    Processing --> Idle : done'; break;
                case 'erDiagram': template = 'erDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains'; break;
                case 'journey': template = 'journey\n    title My amazing journey\n    section Tasks\n      Go home: 5: Me'; break;
                case 'gantt': template = 'gantt\n    dateFormat  YYYY-MM-DD\n    title Project Timeline\n    section Phase 1\n    Task 1: 2024-01-01, 7d'; break;
                case 'pie': template = 'pie title Device Usage\n    "Desktop": 45\n    "Mobile": 35\n    "Tablet": 20'; break;
                case 'mindmap': template = 'mindmap\n  root((My Project))\n    ::icon(fa fa-book)\n    Research\n      ::icon(fa fa-search)\n      Phase 1\n      Phase 2\n    Development\n      ::icon(fa fa-code)\n      Backend\n      Frontend'; break;
                case 'timeline': template = 'timeline\n    title Project Milestones\n    2024-01-15 : Kickoff\n    2024-03-01 : Alpha Release\n    2024-05-01 : Beta Release'; break;
                default: template = type + '\n  ...'; // Basic fallback
            }
            insertText(`\n\`\`\`mermaid\n${template}\n\`\`\`\n`);
            closeAllDropdowns();
        });
    });

    // ECharts Insertion
    document.getElementById('insert-echarts')?.addEventListener('click', (e) => {
        e.preventDefault();
        const template = `\n\`\`\`echarts\n{\n  "title": {\n    "text": "示例图表"\n  },\n  "tooltip": {},\n  "xAxis": {\n    "data": ["A", "B", "C", "D", "E"]\n  },\n  "yAxis": {},\n  "series": [\n    {\n      "name": "数据",\n      "type": "bar",\n      "data": [5, 20, 36, 10, 10]\n    }\n  ]\n}\n\`\`\`\n`;
        insertText(template);
        closeAllDropdowns();
    });

    // --- Layout Toggles ---
    const btnToggleLayout = document.getElementById('btn-toggle-layout');
    const btnPreviewOnly = document.getElementById('btn-preview-only');
    let isPreviewOnly = false; // Start with split view

    function applyLayout() {
        if (isPreviewOnly) {
            editorPane?.classList.add('hidden');
            previewElement?.classList.add('full-width');
            btnToggleLayout.innerHTML = '<i class="fas fa-edit"></i>';
            btnToggleLayout.title = "显示编辑器";
        } else {
            editorPane?.classList.remove('hidden');
            previewElement?.classList.remove('full-width');
            btnToggleLayout.innerHTML = '<i class="fas fa-columns"></i>';
            btnToggleLayout.title = "切换布局";
        }
        // Crucially, refresh CodeMirror AFTER the pane is potentially resized/shown
        if (editor) {
             setTimeout(() => editor.refresh(), 10); // Short delay ensures layout settled
        }
        // Also adjust overall container height in case layout change affects it (unlikely here)
         // adjustEditorHeight();
    }

    btnPreviewOnly?.addEventListener('click', () => {
        isPreviewOnly = true;
        applyLayout();
    });

    btnToggleLayout?.addEventListener('click', () => {
        // This button now toggles between split and preview-only
        isPreviewOnly = !isPreviewOnly;
        applyLayout();
    });

    // --- Export Logic ---
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { // Cleanup after download starts
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function exportHtml() {
        if (!previewElement) return;
        console.log("Exporting HTML...");
        const previewContent = previewElement.innerHTML;
        // Embed necessary styles directly for better portability
        const embeddedStyles = Array.from(document.styleSheets)
            .filter(sheet => sheet.href === null || sheet.href.includes('style.css') || sheet.href.includes('katex') || sheet.href.includes('highlight')) // Include local and key CDN styles
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    // Ignore CORS errors for external stylesheets if necessary, or fetch them if possible
                    console.warn("Could not read rules from stylesheet:", sheet.href, e);
                    return '';
                }
            })
            .join('\n');

        // Check if there are Mermaid diagrams in the content
        const hasMermaid = previewElement.querySelectorAll('div.mermaid').length > 0;

        // For Mermaid: convert rendered SVGs back to source code for re-rendering in exported file,
        // OR keep the SVGs as-is. We'll keep rendered SVGs and also include a fallback.
        // Strategy: replace rendered mermaid divs with the original source code so Mermaid JS can re-render them.
        let exportContent = previewContent;
        if (hasMermaid) {
            // The rendered mermaid divs contain SVGs. We need the original source text.
            // Re-render from markdown source to get the raw mermaid code blocks
            const markdownText = editor.getValue();
            const mermaidBlocks = [];
            // Extract mermaid code blocks from source
            markdownText.replace(/```mermaid\s*\n([\s\S]*?)```/g, (match, code) => {
                mermaidBlocks.push(code.trim());
            });

            // Replace each rendered mermaid div with source code for re-rendering
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = exportContent;
            const mermaidDivs = tempDiv.querySelectorAll('div.mermaid');
            mermaidDivs.forEach((div, index) => {
                if (index < mermaidBlocks.length) {
                    // Replace with clean source code for Mermaid to render on load
                    div.innerHTML = mermaidBlocks[index];
                    // Remove any data-processed attribute so Mermaid will re-process
                    div.removeAttribute('data-processed');
                    div.removeAttribute('data-id');
                }
            });
            exportContent = tempDiv.innerHTML;
        }

        // Check if there are ECharts diagrams
        const hasEcharts = previewElement.querySelectorAll('.echarts-container').length > 0;
        let echartsScript = '';
        if (hasEcharts) {
            // Extract ECharts options from the markdown source
            const markdownText = editor.getValue();
            const echartsBlocks = [];
            markdownText.replace(/```echarts\s*\n([\s\S]*?)```/g, (match, code) => {
                echartsBlocks.push(code.trim());
            });

            if (echartsBlocks.length > 0) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = exportContent;
                const echartsDivs = tempDiv.querySelectorAll('.echarts-container');
                const chartInits = [];
                echartsDivs.forEach((div, index) => {
                    if (index < echartsBlocks.length) {
                        const chartId = 'echarts-export-' + index;
                        div.id = chartId;
                        div.innerHTML = ''; // Clear any existing content
                        chartInits.push(`try { var chart${index} = echarts.init(document.getElementById('${chartId}')); chart${index}.setOption(${echartsBlocks[index]}); } catch(e) { document.getElementById('${chartId}').innerHTML = '<pre style=\"color:red\">ECharts Error: ' + e.message + '</pre>'; }`);
                    }
                });
                // Remove any leftover script.echarts-data tags
                tempDiv.querySelectorAll('script.echarts-data').forEach(s => s.remove());
                exportContent = tempDiv.innerHTML;
                echartsScript = `
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"><\/script>
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            ${chartInits.join('\n            ')}
            window.addEventListener('resize', function() {
                document.querySelectorAll('.echarts-container').forEach(function(el) {
                    var chart = echarts.getInstanceByDom(el);
                    if (chart) chart.resize();
                });
            });
        });
    <\/script>`;
            }
        }

        const mermaidScript = hasMermaid ? `
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script>
    <script>mermaid.initialize({startOnLoad: true, theme: 'default'});<\/script>` : '';

        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${document.getElementById('doc-title')?.value || 'Exported Document'}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        /* Embed crucial styles directly */
        ${embeddedStyles}
        /* Ensure base markdown body style is present */
        .markdown-body { line-height: 1.7; color: #24292e; }
        .mermaid { margin: 16px 0; text-align: center; }
        .echarts-container { width: 100%; height: 400px; margin: 16px 0; }
    </style>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">${mermaidScript}${echartsScript}
</head>
<body class="markdown-body">
    ${exportContent}
</body>
</html>`;
        downloadFile( (document.getElementById('doc-title')?.value || 'document') + '.html', fullHtml, 'text/html;charset=utf-8');
    }

    function exportPng() {
        if (!previewElement) return;
        console.log("Exporting PNG...");
        
        // Ensure preview is visible and properly rendered before export
        const wasHidden = editorPane?.classList.contains('hidden');
        const wasFullWidth = previewElement?.classList.contains('full-width');
        
        // Temporarily show preview in full width for better export
        if (!wasHidden) {
            editorPane?.classList.add('hidden');
            previewElement?.classList.add('full-width');
        }
        
        // Wait a moment for layout to settle
        setTimeout(() => {
            // --- Pre-process: Convert ECharts canvas to static images ---
            const echartsContainers = previewElement.querySelectorAll('.echarts-container');
            const echartsBackup = [];
            echartsContainers.forEach((container) => {
                const chartInstance = typeof echarts !== 'undefined' ? echarts.getInstanceByDom(container) : null;
                if (chartInstance) {
                    try {
                        const dataUrl = chartInstance.getDataURL({
                            type: 'png',
                            pixelRatio: 2,
                            backgroundColor: chartInstance.getOption().backgroundColor || '#fff'
                        });
                        echartsBackup.push({ container, originalHTML: container.innerHTML });
                        container.innerHTML = `<img src="${dataUrl}" style="width:100%;height:auto;display:block;" />`;
                    } catch (e) {
                        console.warn('Failed to convert ECharts for PNG export:', e);
                        echartsBackup.push({ container, originalHTML: container.innerHTML });
                    }
                } else {
                    const canvas = container.querySelector('canvas');
                    if (canvas) {
                        try {
                            const dataUrl = canvas.toDataURL('image/png');
                            echartsBackup.push({ container, originalHTML: container.innerHTML });
                            container.innerHTML = `<img src="${dataUrl}" style="width:100%;height:auto;display:block;" />`;
                        } catch (e) {
                            echartsBackup.push({ container, originalHTML: container.innerHTML });
                        }
                    }
                }
            });

            // --- Pre-process: Convert Mermaid SVGs to inline images ---
            const mermaidBlocks = previewElement.querySelectorAll('.mermaid');
            const mermaidBackup = [];
            mermaidBlocks.forEach((block) => {
                const svg = block.querySelector('svg');
                if (svg) {
                    try {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const base64 = btoa(unescape(encodeURIComponent(svgData)));
                        const dataUrl = 'data:image/svg+xml;base64,' + base64;
                        const svgRect = svg.getBoundingClientRect();
                        const svgWidth = svgRect.width || 600;
                        
                        mermaidBackup.push({ block, originalHTML: block.innerHTML });
                        block.innerHTML = `<img src="${dataUrl}" style="width:${svgWidth}px;max-width:100%;height:auto;display:block;margin:0 auto;" />`;
                    } catch (e) {
                        mermaidBackup.push({ block, originalHTML: block.innerHTML });
                    }
                }
            });

            const options = {
                 useCORS: true,
                 allowTaint: true,
                 logging: false,
                 scale: window.devicePixelRatio * 1.5,
                 backgroundColor: '#ffffff',
                 width: previewElement.scrollWidth,
                 height: previewElement.scrollHeight,
                 windowWidth: previewElement.scrollWidth,
                 windowHeight: previewElement.scrollHeight
            };
            
            html2canvas(previewElement, options).then(canvas => {
                 const dataUrl = canvas.toDataURL('image/png');
                 const link = document.createElement('a');
                 link.download = (document.getElementById('doc-title')?.value || 'document') + '.png';
                 link.href = dataUrl;
                 link.click();
                 link.remove();
                 
                 // Restore ECharts and Mermaid
                 echartsBackup.forEach(({ container, originalHTML }) => { container.innerHTML = originalHTML; });
                 mermaidBackup.forEach(({ block, originalHTML }) => { block.innerHTML = originalHTML; });
                 renderPreview();
                 
                 // Restore original layout
                 if (!wasHidden) {
                     editorPane?.classList.remove('hidden');
                 }
                 if (!wasFullWidth) {
                     previewElement?.classList.remove('full-width');
                 }
                 if (editor) editor.refresh();
             }).catch(err => {
                 console.error("Export PNG failed:", err);
                 alert(`导出 PNG 失败: ${err.message}\n请检查浏览器控制台获取详细信息。`);
                 
                 // Restore ECharts and Mermaid on error
                 echartsBackup.forEach(({ container, originalHTML }) => { container.innerHTML = originalHTML; });
                 mermaidBackup.forEach(({ block, originalHTML }) => { block.innerHTML = originalHTML; });
                 renderPreview();
                 
                 // Restore layout even on error
                 if (!wasHidden) {
                     editorPane?.classList.remove('hidden');
                 }
                 if (!wasFullWidth) {
                     previewElement?.classList.remove('full-width');
                 }
                 if (editor) editor.refresh();
             });
        }, 100);
    }

    function exportPdf() {
        if (!previewElement) return;
        console.log("Exporting PDF...");
        
        // Ensure preview is visible and properly rendered before export
        const wasHidden = editorPane?.classList.contains('hidden');
        const wasFullWidth = previewElement?.classList.contains('full-width');
        
        // Temporarily show preview in full width for better export
        if (!wasHidden) {
            editorPane?.classList.add('hidden');
            previewElement?.classList.add('full-width');
        }
        
        // Wait a moment for layout to settle and charts to render
        setTimeout(() => {

        // --- Pre-process: Convert ECharts canvas to static images before cloning ---
        const echartsContainers = previewElement.querySelectorAll('.echarts-container');
        const echartsBackup = []; // Store original content for restoration
        echartsContainers.forEach((container) => {
            const chartInstance = typeof echarts !== 'undefined' ? echarts.getInstanceByDom(container) : null;
            if (chartInstance) {
                try {
                    // Get the chart as a data URL image
                    const dataUrl = chartInstance.getDataURL({
                        type: 'png',
                        pixelRatio: 2,
                        backgroundColor: chartInstance.getOption().backgroundColor || '#fff'
                    });
                    // Backup original innerHTML
                    echartsBackup.push({ container, originalHTML: container.innerHTML });
                    // Replace canvas with a static image
                    container.innerHTML = `<img src="${dataUrl}" style="width:100%;height:auto;display:block;" />`;
                } catch (e) {
                    console.warn('Failed to convert ECharts to image for PDF:', e);
                    echartsBackup.push({ container, originalHTML: container.innerHTML });
                }
            } else {
                // No chart instance - the container might just have a canvas from a previous render
                const canvas = container.querySelector('canvas');
                if (canvas) {
                    try {
                        const dataUrl = canvas.toDataURL('image/png');
                        echartsBackup.push({ container, originalHTML: container.innerHTML });
                        container.innerHTML = `<img src="${dataUrl}" style="width:100%;height:auto;display:block;" />`;
                    } catch (e) {
                        console.warn('Failed to convert canvas to image for PDF:', e);
                        echartsBackup.push({ container, originalHTML: container.innerHTML });
                    }
                }
            }
        });

        // --- Pre-process: Convert Mermaid SVGs to inline images for better html2canvas compatibility ---
        const mermaidBlocks = previewElement.querySelectorAll('.mermaid');
        const mermaidBackup = [];
        mermaidBlocks.forEach((block) => {
            const svg = block.querySelector('svg');
            if (svg) {
                try {
                    // Serialize SVG to a base64 data URL (avoids blob URL issues with html2canvas)
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const base64 = btoa(unescape(encodeURIComponent(svgData)));
                    const dataUrl = 'data:image/svg+xml;base64,' + base64;
                    const svgRect = svg.getBoundingClientRect();
                    const svgWidth = svgRect.width || 600;
                    
                    mermaidBackup.push({ block, originalHTML: block.innerHTML });
                    block.innerHTML = `<img src="${dataUrl}" style="width:${svgWidth}px;max-width:100%;height:auto;display:block;margin:0 auto;" />`;
                } catch (e) {
                    console.warn('Failed to convert Mermaid SVG to image for PDF:', e);
                    mermaidBackup.push({ block, originalHTML: block.innerHTML });
                }
            }
        });

        // Create a temporary container for PDF export with proper styling
         const exportContainer = document.createElement('div');
         // Use a wider container for better PDF layout
         exportContainer.style.cssText = `
             position: absolute;
             top: -9999px;
             left: -9999px;
             width: 1200px;
             padding: 35px;
             background: white;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
             line-height: 1.7;
             color: #24292e;
             font-size: 16px;
             box-sizing: border-box;
         `;
        
        // Clone the preview content
        const clonedContent = previewElement.cloneNode(true);
        
        // Apply PDF-specific styles to the cloned content
        const pdfStyles = document.createElement('style');
        pdfStyles.textContent = `
            .markdown-body {
                line-height: 1.6 !important;
                color: #24292e !important;
                font-size: 14px !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .echarts-container {
                margin: 16px 0 !important;
                page-break-inside: avoid !important;
                background: #212121 !important;
                border-radius: 6px !important;
                padding: 8px !important;
            }
            .echarts-container img {
                display: block !important;
                width: 100% !important;
                height: auto !important;
            }
            .markdown-body h1 {
                font-size: 24px !important;
                margin: 20px 0 16px 0 !important;
                padding-bottom: 8px !important;
                border-bottom: 2px solid #eaecef !important;
                page-break-after: avoid !important;
            }
            .markdown-body h2 {
                font-size: 20px !important;
                margin: 18px 0 14px 0 !important;
                padding-bottom: 6px !important;
                border-bottom: 1px solid #eaecef !important;
                page-break-after: avoid !important;
            }
            .markdown-body h3 {
                font-size: 18px !important;
                margin: 16px 0 12px 0 !important;
                page-break-after: avoid !important;
            }
            .markdown-body h4, .markdown-body h5, .markdown-body h6 {
                font-size: 16px !important;
                margin: 14px 0 10px 0 !important;
                page-break-after: avoid !important;
            }
            .markdown-body p {
                margin: 0 0 12px 0 !important;
                orphans: 3 !important;
                widows: 3 !important;
            }
            .markdown-body pre {
                background-color: #f6f8fa !important;
                border: 1px solid #e1e4e8 !important;
                border-radius: 6px !important;
                padding: 12px !important;
                margin: 12px 0 !important;
                overflow: visible !important;
                page-break-inside: avoid !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
            }
            .markdown-body code {
                background-color: rgba(27,31,35,0.05) !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
                font-size: 12px !important;
            }
            .markdown-body blockquote {
                border-left: 4px solid #dfe2e5 !important;
                padding: 0 16px !important;
                margin: 12px 0 !important;
                color: #6a737d !important;
            }
            .markdown-body table {
                border-collapse: collapse !important;
                margin: 12px 0 !important;
                width: 100% !important;
                page-break-inside: avoid !important;
            }
            .markdown-body th, .markdown-body td {
                border: 1px solid #dfe2e5 !important;
                padding: 8px 12px !important;
                text-align: left !important;
            }
            .markdown-body th {
                background-color: #f6f8fa !important;
                font-weight: 600 !important;
            }
            .markdown-body ul, .markdown-body ol {
                margin: 12px 0 !important;
                padding-left: 24px !important;
            }
            .markdown-body li {
                margin-bottom: 4px !important;
            }
            .katex-display {
                margin: 16px 0 !important;
                text-align: center !important;
                page-break-inside: avoid !important;
            }
            .mermaid {
                margin: 16px 0 !important;
                text-align: center !important;
                page-break-inside: avoid !important;
            }
            .mermaid svg {
                max-width: 100% !important;
                height: auto !important;
            }
            @media print {
                .markdown-body {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
            }
        `;
        
        exportContainer.appendChild(pdfStyles);
        exportContainer.appendChild(clonedContent);
        document.body.appendChild(exportContainer);
        
        // Wait for all images in the export container to load before capturing
        const allImages = exportContainer.querySelectorAll('img');
        const imageLoadPromises = Array.from(allImages).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Don't block on failed images
            });
        });
        
        Promise.all(imageLoadPromises).then(() => {
        // Use html2canvas with optimized settings for PDF
        const options = {
            useCORS: true,
            allowTaint: true,
            logging: false,
            scale: 2, // Higher scale for better quality charts
            backgroundColor: '#ffffff',
            width: exportContainer.scrollWidth,
            height: exportContainer.scrollHeight,
            windowWidth: exportContainer.scrollWidth,
            windowHeight: exportContainer.scrollHeight
        };
        
        html2canvas(exportContainer, options).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ 
                orientation: 'p', 
                unit: 'mm', 
                format: 'a4',
                compress: true
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
             const pdfHeight = pdf.internal.pageSize.getHeight();
             const margin = 5; // mm - 进一步减小边距以最大化内容区域
             const usableWidth = pdfWidth - 2 * margin;
             const usableHeight = pdfHeight - 2 * margin;
            
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            
            // Calculate width ratio to fill PDF width while maintaining proportions
            const widthRatio = usableWidth / (imgWidth * 0.264583);
            
            const finalWidth = usableWidth; // Use full PDF width
            const finalHeight = imgHeight * 0.264583 * widthRatio;
            
            // Position content at margin
            const xPos = margin;
            const yPos = margin;
            
            // Smart pagination for better content splitting
            if (finalHeight > usableHeight) {
                console.log("Content requires pagination...");
                const pageHeight = usableHeight / widthRatio / 0.264583; // Convert back to canvas pixels
                let currentY = 0;
                let pageNum = 0;
                
                while (currentY < imgHeight) {
                    if (pageNum > 0) {
                        pdf.addPage();
                    }
                    
                    const remainingHeight = imgHeight - currentY;
                    const sliceHeight = Math.min(pageHeight, remainingHeight);
                    
                    // Create a canvas for this page
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = imgWidth;
                    pageCanvas.height = sliceHeight;
                    const pageCtx = pageCanvas.getContext('2d');
                    
                    // Draw the slice
                    pageCtx.drawImage(canvas, 0, currentY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
                    
                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.9);
                    const pageImgHeight = sliceHeight * 0.264583 * widthRatio;
                    
                    pdf.addImage(pageImgData, 'JPEG', xPos, margin, finalWidth, pageImgHeight);
                    
                    currentY += sliceHeight;
                    pageNum++;
                }
            } else {
                // Single page
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                pdf.addImage(imgData, 'JPEG', xPos, yPos, finalWidth, finalHeight);
            }
            
            // Save the PDF
            const filename = (document.getElementById('doc-title')?.value || 'document') + '.pdf';
            pdf.save(filename);
            
            // Clean up
            document.body.removeChild(exportContainer);
            
            // Restore ECharts original content
            echartsBackup.forEach(({ container, originalHTML }) => {
                container.innerHTML = originalHTML;
            });
            
            // Restore Mermaid original content
            mermaidBackup.forEach(({ block, originalHTML }) => {
                block.innerHTML = originalHTML;
            });
            
            // Re-render preview to restore live charts
            renderPreview();
            
            // Restore original layout
            if (!wasHidden) {
                editorPane?.classList.remove('hidden');
            }
            if (!wasFullWidth) {
                previewElement?.classList.remove('full-width');
            }
            if (editor) editor.refresh();
            
        }).catch(err => {
            console.error("Export PDF failed:", err);
            alert(`导出 PDF 失败: ${err.message}\n建议使用浏览器的"打印 -> 另存为 PDF"功能作为替代方案。`);
            
            // Clean up on error
            if (document.body.contains(exportContainer)) {
                document.body.removeChild(exportContainer);
            }
            
            // Restore ECharts original content on error
            echartsBackup.forEach(({ container, originalHTML }) => {
                container.innerHTML = originalHTML;
            });
            
            // Restore Mermaid original content on error
            mermaidBackup.forEach(({ block, originalHTML }) => {
                block.innerHTML = originalHTML;
            });
            
            // Re-render preview to restore live charts
            renderPreview();
            
            // Restore layout even on error
            if (!wasHidden) {
                editorPane?.classList.remove('hidden');
            }
            if (!wasFullWidth) {
                previewElement?.classList.remove('full-width');
            }
            if (editor) editor.refresh();
        });
        }); // End Promise.all().then()
        }, 100);
    }

    // Copy functions
    async function copyToClipboard(text, type) {
        try {
            await navigator.clipboard.writeText(text);
            alert(`${type} 已复制到剪贴板！`);
        } catch (err) {
            console.error('复制失败:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert(`${type} 已复制到剪贴板！`);
            } catch (err2) {
                alert(`复制失败: ${err2.message}`);
            }
            document.body.removeChild(textArea);
        }
    }

    function copyMarkdown() {
        if (!editor) return;
        const markdownText = editor.getValue();
        copyToClipboard(markdownText, 'Markdown源码');
    }

    function copyHtml() {
        if (!previewElement) return;
        const htmlContent = previewElement.innerHTML;
        copyToClipboard(htmlContent, 'HTML代码');
    }

    function copyWechatFormat() {
        if (!previewElement) return;
        
        // 创建一个临时容器来处理内容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = previewElement.innerHTML;
        
        // 首先全局移除所有br标签（特别是数学公式中的）
        const allBrTags = tempDiv.querySelectorAll('br');
        allBrTags.forEach(br => br.remove());
        
        // 更彻底地清理HTML内容中的br标签（包括文本形式的）
        let htmlContent = tempDiv.innerHTML;
        
        // 多轮清理，确保所有形式的br标签都被移除
        const brPatterns = [
            /<br\s*\/?>/gi,           // 标准br标签
            /&lt;br\s*\/?&gt;/gi,      // HTML实体形式的br
            /&lt;\s*br\s*&gt;/gi,       // 带空格的HTML实体br
            /&lt;\s*br\s*\/\s*&gt;/gi, // 自闭合的HTML实体br
            /<\s*br\s*>/gi,          // 带空格的br标签
            /<\s*br\s*\/\s*>/gi,    // 带空格的自闭合br标签
        ];
        
        brPatterns.forEach(pattern => {
            htmlContent = htmlContent.replace(pattern, ' ');
        });
        
        // 规范化空白字符
        htmlContent = htmlContent.replace(/\s+/g, ' ');
        
        tempDiv.innerHTML = htmlContent;
        
        // 处理数学公式 - 完全转换为纯文本
        const mathElements = tempDiv.querySelectorAll('.katex, .katex-display');
        mathElements.forEach(mathEl => {
            try {
                // 尝试获取原始LaTeX代码
                const annotation = mathEl.querySelector('annotation[encoding="application/x-tex"]');
                let mathText = '';
                
                if (annotation && annotation.textContent) {
                    // 使用原始LaTeX代码，但也需要清理
                    mathText = annotation.textContent
                        .replace(/&lt;/g, '<')  // 解码HTML实体
                        .replace(/&gt;/g, '>')  // 解码HTML实体
                        .replace(/&amp;/g, '&') // 解码HTML实体
                        .replace(/<br\s*\/?>/gi, ' ')  // 移除br标签
                        .replace(/[\r\n\t]+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                } else {
                    // 降级：提取可见文本并清理
                    mathText = (mathEl.textContent || mathEl.innerText || '')
                        .replace(/&lt;/g, '<')  // 解码HTML实体
                        .replace(/&gt;/g, '>')  // 解码HTML实体
                        .replace(/&amp;/g, '&') // 解码HTML实体
                        .replace(/<br\s*\/?>/gi, ' ')  // 移除br标签
                        .replace(/[\r\n\t]+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                }
                
                if (mathText) {
                    // 判断是否为块级数学公式
                    const isDisplayMath = mathEl.classList.contains('katex-display');
                    
                    // 创建纯文本替换
                    const replacement = document.createTextNode(mathText);
                    
                    if (isDisplayMath) {
                        // 块级公式：创建带样式的div
                        const mathDiv = document.createElement('div');
                        mathDiv.style.cssText = `
                            text-align: center;
                            margin: 16px 0;
                            font-size: 1.2em;
                            font-style: italic;
                            color: #2c3e50;
                            font-weight: bold;
                            padding: 8px;
                            background-color: #f8f9fa;
                            border-radius: 4px;
                        `;
                        mathDiv.appendChild(replacement);
                        mathEl.replaceWith(mathDiv);
                    } else {
                        // 行内公式：创建带样式的span
                        const mathSpan = document.createElement('span');
                        mathSpan.style.cssText = `
                            font-style: italic;
                            color: #2c3e50;
                            font-weight: bold;
                            background-color: #f8f9fa;
                            padding: 2px 4px;
                            border-radius: 3px;
                            margin: 0 2px;
                        `;
                        mathSpan.appendChild(replacement);
                        mathEl.replaceWith(mathSpan);
                    }
                }
            } catch (e) {
                console.warn('处理数学公式时出错:', e);
                // 最终降级：直接移除元素或替换为空文本
                mathEl.replaceWith(document.createTextNode('[数学公式]'));
            }
        });
        
        // 处理剩余的br标签（防止遗漏）
        const remainingBrTags = tempDiv.querySelectorAll('br');
        remainingBrTags.forEach(br => {
            const mathParent = br.closest('span[style*="italic"], .katex, .katex-display');
            if (mathParent) {
                br.remove();
            }
        });
        
        // 处理代码块 - 转换为纯文本格式
        const codeBlocks = tempDiv.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            const codeText = codeBlock.textContent || codeBlock.innerText;
            const newCodeBlock = document.createElement('div');
            newCodeBlock.innerHTML = `<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; border-left: 4px solid #42b983; overflow-x: auto; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${codeText}</pre>`;
            codeBlock.parentNode.replaceWith(newCodeBlock.firstChild);
        });
        
        // 处理引用块
        const blockquotes = tempDiv.querySelectorAll('blockquote');
        blockquotes.forEach(bq => {
            bq.style.cssText = 'border-left: 4px solid #ddd; margin: 0; padding: 0 15px; color: #777;';
        });
        
        // 处理标题
        const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            const level = heading.tagName.toLowerCase();
            if (level === 'h1') {
                heading.style.cssText = 'color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;';
            } else if (level === 'h2') {
                heading.style.cssText = 'color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 8px;';
            } else {
                heading.style.cssText = 'color: #34495e;';
            }
        });
        
        // 处理段落
        const paragraphs = tempDiv.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.cssText = 'line-height: 1.8; margin: 1em 0;';
        });
        
        // 处理列表
        const lists = tempDiv.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.style.cssText = 'line-height: 1.8;';
        });
        
        // 处理链接
        const links = tempDiv.querySelectorAll('a');
        links.forEach(link => {
            link.style.cssText = 'color: #3498db; text-decoration: none;';
        });
        
        // 处理强调文本
        const strongs = tempDiv.querySelectorAll('strong');
        strongs.forEach(strong => {
            strong.style.cssText = 'color: #e74c3c;';
        });
        
        const ems = tempDiv.querySelectorAll('em');
        ems.forEach(em => {
            em.style.cssText = 'color: #9b59b6;';
        });
        
        // 移除Mermaid图表
        const mermaidDivs = tempDiv.querySelectorAll('div[class*="mermaid"]');
        mermaidDivs.forEach(div => {
            const placeholder = document.createElement('p');
            placeholder.style.cssText = 'color: #e67e22; font-style: italic;';
            placeholder.textContent = '[此处包含图表，请在原文中查看]';
            div.replaceWith(placeholder);
        });
        
        // 移除所有class和id属性
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            el.removeAttribute('class');
            el.removeAttribute('id');
        });
        
        copyToClipboard(tempDiv.innerHTML, '公众号格式');
    }

    // Connect export dropdown items to functions
    document.getElementById('export-md-menu')?.addEventListener('click', (e) => {
         e.preventDefault();
         if (!editor) return;
         triggerDownload('md', editor.getValue(), 'text/markdown;charset=utf-8');
         closeAllDropdowns();
     });
    document.getElementById('export-html-menu')?.addEventListener('click', (e) => { e.preventDefault(); exportHtml(); closeAllDropdowns(); });
    document.getElementById('export-png-menu')?.addEventListener('click', (e) => { e.preventDefault(); exportPng(); closeAllDropdowns(); });
    document.getElementById('export-pdf-menu')?.addEventListener('click', (e) => { e.preventDefault(); exportPdf(); closeAllDropdowns(); });
    document.getElementById('copy-md-menu')?.addEventListener('click', (e) => { e.preventDefault(); copyMarkdown(); closeAllDropdowns(); });
    document.getElementById('copy-html-menu')?.addEventListener('click', (e) => { e.preventDefault(); copyHtml(); closeAllDropdowns(); });
    document.getElementById('copy-wechat-menu')?.addEventListener('click', (e) => { e.preventDefault(); copyWechatFormat(); closeAllDropdowns(); });

     // Helper for direct download trigger (used for MD)
    function triggerDownload(type, content, mime) {
          downloadFile((document.getElementById('doc-title')?.value || 'document') + '.' + type, content, mime);
    }


    // --- TOC Logic ---
    function generateAndShowToc() {
        if (!tocModal || !tocListContainer || !previewElement) return;
        console.log("Generating TOC...");
        const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
        tocListContainer.innerHTML = ''; // Clear previous

        if (headings.length === 0) {
            tocListContainer.innerHTML = '<p><i>文档中未找到标题。</i></p>';
            tocModal.style.display = 'block';
            return;
        }

        const tocList = document.createElement('ul');
        const idCounters = {}; // To handle duplicate auto-generated IDs

        headings.forEach((heading) => {
            const level = parseInt(heading.tagName.substring(1), 10);
            const text = heading.textContent.trim();
            if (!text) return; // Skip empty headings

            let id = heading.id;
            if (!id) {
                id = 'heading-' + text.toLowerCase()
                                     .replace(/[\s#?&/\\.,:;*<>"'|()\[\]{}]/g, '-') // Replace spaces and many symbols with dash
                                     .replace(/-+/g, '-') // Collapse multiple dashes
                                     .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
                if (!id) id = 'heading-auto'; // Fallback if text was only symbols

                // Ensure uniqueness if auto-generating
                if (idCounters[id] !== undefined) {
                    idCounters[id]++;
                    id = `${id}-${idCounters[id]}`;
                } else {
                    idCounters[id] = 0;
                }
                heading.id = id; // Assign the generated ID back to the element
            }

            const listItem = document.createElement('li');
            listItem.classList.add(`toc-level-${level}`);

            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = text;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetElement = document.getElementById(id);
                if (targetElement) {
                    // Scroll the preview pane, not the window
                    previewElement.scrollTo({
                        top: targetElement.offsetTop - 15, // Offset from top of preview pane
                        behavior: 'smooth'
                    });
                }
                tocModal.style.display = 'none'; // Close modal
            });

            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });

        tocListContainer.appendChild(tocList);
        tocModal.style.display = 'block';
    }

    // TOC Button Listener
    tocButton?.addEventListener('click', generateAndShowToc);

    // Modal Close Listeners
    tocCloseButton?.addEventListener('click', () => { tocModal.style.display = 'none'; });
    window.addEventListener('click', (event) => {
        if (event.target === tocModal) { tocModal.style.display = 'none'; }
    });
     window.addEventListener('keydown', (event) => { // Close modal on Escape key
        if (event.key === 'Escape' && tocModal && tocModal.style.display === 'block') {
             tocModal.style.display = 'none';
        }
     });


    // --- Other Buttons ---
    document.getElementById('btn-help')?.addEventListener('click', () => alert('帮助功能尚未实现。\n可参考 Markdown 语法或 Mermaid/KaTeX 文档。'));
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                 alert(`全屏失败: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                 document.exitFullscreen();
            }
        }
    });

    console.log("Editor initialization complete.");

}); // End DOMContentLoaded