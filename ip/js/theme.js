// ========== Theme Toggle (shared across all pages) ==========
(function() {
    // Apply saved theme immediately to avoid flash
    const saved = localStorage.getItem('iptest-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        updateIcon(saved);

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('iptest-theme', next);
            updateIcon(next);
        });
    });

    function updateIcon(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? '切换到浅色模式' : '切换到深色模式';
    }
})();
