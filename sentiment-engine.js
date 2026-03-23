/**
 * SentimentEngine - Core logic for Phase 10: Sentiment Evolution
 * Handles multi-line emotions chart and "Voice of the Crowd" simulation.
 */

const SentimentEngine = {
    chartId: 'sentimentChart',
    feedId: 'crowdFeed',
    data: [],

    init() {
        console.log("SentimentEngine: Initializing");
        this.generateSimulatedData();
        this.renderChart();
        this.renderFeed();
    },

    generateSimulatedData() {
        const points = 10;
        this.data = [];
        for (let i = 0; i < points; i++) {
            this.data.push({
                x: (i / (points - 1)) * 800,
                joy: 40 + Math.random() * 40,
                interest: 30 + Math.random() * 50,
                hype: 50 + Math.random() * 30
            });
        }
    },

    renderChart() {
        const container = document.getElementById(this.chartId);
        if (!container) return;

        const createPath = (key, color) => {
            const pathData = this.data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${500 - (p[key] * 4)}`).join(' ');
            return `
                <path d="${pathData}" stroke="${color}" stroke-width="3" fill="none" style="filter:drop-shadow(0 0 5px ${color}40); stroke-linecap:round; stroke-linejoin:round; transition: all 1s ease-in-out;">
                    <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="2s" fill="freeze" />
                </path>
            `;
        };

        container.innerHTML = `
            <svg viewBox="0 0 800 500" style="width:100%; height:100%; overflow:visible;">
                <defs>
                    <linearGradient id="joyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--accent);stop-opacity:0.2" />
                        <stop offset="100%" style="stop-color:var(--accent);stop-opacity:0" />
                    </linearGradient>
                </defs>
                <!-- Grid Lines -->
                ${[0, 25, 50, 75, 100].map(v => `<line x1="0" y1="${500 - v * 4}" x2="800" y2="${500 - v * 4}" stroke="var(--border)" stroke-dasharray="4 4" />`).join('')}
                
                ${createPath('joy', 'var(--accent)')}
                ${createPath('interest', 'var(--blue)')}
                ${createPath('hype', 'var(--green)')}
            </svg>
        `;
    },

    renderFeed() {
        const container = document.getElementById(this.feedId);
        if (!container) return;

        const comments = [
            { user: "@cyberPunk2077", text: "Questo progetto sta andando in una direzione pazzesca! 😍", mood: "joy" },
            { user: "@anon_42", text: "Bello, ma vorrei vedere più integrazioni con la blockchain.", mood: "interest" },
            { user: "@artLover", text: "Le grafiche sono spaziali. Complimenti al team!", mood: "joy" },
            { user: "@techCritic", text: "Interessante, ma reggerà il carico di utenti? 🤔", mood: "hype" }
        ];

        container.innerHTML = comments.map(c => `
            <div style="padding:12px; background:var(--bg3); border:1px solid var(--border); border-radius:12px; margin-bottom:10px; animation: slideInUp 0.4s ease-out;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span style="font-weight:700; font-size:0.75rem; color:var(--text);">${c.user}</span>
                    <span style="font-size:0.55rem; padding:2px 6px; border-radius:10px; background:${c.mood === 'joy' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)'}; color:${c.mood === 'joy' ? 'var(--green)' : 'var(--blue)'}; text-transform:uppercase;">${c.mood}</span>
                </div>
                <div style="font-size:0.8rem; color:var(--dim); line-height:1.4;">"${c.text}"</div>
            </div>
        `).join('');
    }
};
