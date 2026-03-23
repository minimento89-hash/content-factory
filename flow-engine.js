/**
 * FlowEngine - Core logic for Phase 9: Logic Flows & Studio Mappe
 * Handles SVG-based agent workflow visualization.
 */

const FlowEngine = {
    canvasId: 'flowCanvas',
    nodes: [],
    links: [],

    init(containerId) {
        console.log("FlowEngine: Initializing in", containerId);
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <svg id="${this.canvasId}" width="100%" height="100%" viewBox="0 0 800 500" style="background:var(--bg1); border-radius:var(--radius); overflow:visible;">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--dim)" />
                    </marker>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <g id="linksLayer"></g>
                <g id="nodesLayer"></g>
            </svg>
        `;
        
        this.generateFlow();
    },

    generateFlow() {
        // Core Layout: Center -> Production -> Result
        const center = { id: 'chief', x: 400, y: 250, label: 'Regista', emoji: '👑', color: 'var(--accent)' };
        
        const production = [
            { id: 'writer', x: 200, y: 100, label: 'Scrittore', emoji: '✍️', color: 'var(--blue)' },
            { id: 'visual', x: 200, y: 400, label: 'Visual', emoji: '🎨', color: 'var(--purple)' },
            { id: 'social', x: 600, y: 100, label: 'Social', emoji: '📱', color: 'var(--green)' },
            { id: 'analyst', x: 600, y: 400, label: 'Analyst', emoji: '📊', color: 'var(--blue)' }
        ];

        this.nodes = [center, ...production];
        
        // Logical Connections
        this.links = [
            { source: 'chief', target: 'writer' },
            { source: 'chief', target: 'visual' },
            { source: 'writer', target: 'social' },
            { source: 'visual', target: 'social' },
            { source: 'social', target: 'analyst' },
            { source: 'analyst', target: 'chief' } // Optimization Loop
        ];

        this.render();
    },

    render() {
        const nodesLayer = document.getElementById('nodesLayer');
        const linksLayer = document.getElementById('linksLayer');
        if (!nodesLayer || !linksLayer) return;

        // Render Links
        linksLayer.innerHTML = this.links.map((link, i) => {
            const s = this.nodes.find(n => n.id === link.source);
            const t = this.nodes.find(n => n.id === link.target);
            const id = `link-${i}`;
            return `
                <path d="M ${s.x} ${s.y} L ${t.x} ${t.y}" stroke="var(--border)" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />
                <circle r="4" fill="var(--accent)" style="filter:url(#glow)">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M ${s.x} ${s.y} L ${t.x} ${t.y}" begin="${i * 0.5}s" />
                </circle>
            `;
        }).join('');

        // Render Nodes
        nodesLayer.innerHTML = this.nodes.map(node => `
            <g class="flow-node" transform="translate(${node.x}, ${node.y})" style="cursor:pointer;" onclick="showToast('Agente: ${node.label}')">
                <circle r="30" fill="var(--bg2)" stroke="${node.color}" stroke-width="2" />
                <text y="5" text-anchor="middle" font-size="20px">${node.emoji}</text>
                <text y="45" text-anchor="middle" fill="var(--text)" font-size="10px" font-weight="700" style="text-transform:uppercase; letter-spacing:0.05em;">${node.label}</text>
            </g>
        `).join('');
    }
};
