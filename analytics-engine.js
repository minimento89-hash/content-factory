/**
 * Analytics Engine V1.0
 * Custom SVG Charts & Performance Monitoring
 */
const AnalyticsEngine = {
    data: {
        hype: [],
        views: [],
        earnings: [],
        agentActivity: {}
    },

    /**
     * Initialize Analytics for a specific studio
     */
    init(studioId) {
        console.log("📊 AnalyticsEngine: Initializing for", studioId);
        this.generateSimulatedData(studioId);
    },

    /**
     * Generate placeholder data if none exists
     */
    generateSimulatedData(studioId) {
        const seed = studioId.length;
        const hype = [];
        const views = [];
        let totalViews = 0;
        
        for (let i = 0; i < 30; i++) {
            const h = Math.floor(Math.random() * 20) + 60 + (i * 0.5);
            hype.push(Math.min(100, h));
            
            const v = Math.floor(Math.random() * 5000) + 2000 + (i * 100);
            totalViews += v;
            views.push(totalViews);
        }
        
        this.data.hype = hype;
        this.data.views = views;
        this.data.earnings = views.map(v => (v * 0.0003).toFixed(2));
    },

    /**
     * Render a Sparkline (Line Chart) using SVG
     */
    renderLineChart(containerId, data, color) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        const padding = 20;
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((val - min) / range) * (height - padding * 2) - padding;
            return `${x},${y}`;
        }).join(' ');
        
        const svg = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="grad-${containerId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                    </linearGradient>
                </defs>
                <path d="M ${points} L ${width-padding},${height-padding} L ${padding},${height-padding} Z" fill="url(#grad-${containerId})" />
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 5px ${color}44);" />
            </svg>
        `;
        
        container.innerHTML = svg;
    },

    /**
     * Render a Bar Chart (Category Distribution)
     */
    renderBarChart(containerId, labels, values, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const max = Math.max(...values);
        
        let html = '<div style="display:flex;height:100%;align-items:flex-end;gap:12px;padding:10px;">';
        values.forEach((val, i) => {
            const h = (val / max) * 100;
            html += `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <div style="font-size:0.5rem;color:var(--dim);">${val}</div>
                    <div style="width:100%;height:${h}%;background:${colors[i] || 'var(--accent)'};border-radius:4px;transition:height 1s cubic-bezier(0.4,0,0.2,1);"></div>
                    <div style="font-size:0.55rem;color:var(--mid);text-transform:uppercase;letter-spacing:0.05em;writing-mode:vertical-lr;transform:rotate(180deg);">${labels[i]}</div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }
};
