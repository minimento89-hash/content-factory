const FlowEngine = {
    canvasId: 'flowCanvas',
    nodes: [],
    links: [],
    draggingNode: null,
    offset: { x: 0, y: 0 },

    init(containerId) {
        console.log("FlowEngine: Initializing in", containerId);
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <svg id="${this.canvasId}" width="100%" height="100%" viewBox="0 0 800 500" style="background:var(--bg1); border-radius:var(--radius); overflow:visible; user-select:none;">
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

        const svg = document.getElementById(this.canvasId);
        svg.addEventListener('mousemove', (e) => this.onDrag(e));
        svg.addEventListener('mouseup', () => this.stopDrag());
        svg.addEventListener('mouseleave', () => this.stopDrag());
        
        this.generateFlow();
    },

    generateFlow() {
        const studioId = localStorage.getItem('cf_active_studio') || 'cmr';
        console.log("FlowEngine: Generating flow for studio:", studioId);
        const profile = JSON.parse(localStorage.getItem('cf_profile') || '{"name":"Il Capo","emoji":"🦁"}');
        const savedPos = JSON.parse(localStorage.getItem(`cf_flow_positions_${studioId}`) || '{}');

        // 1. Get filtered agents (matching logic in html)
        let selected = [];
        try {
            const raw = localStorage.getItem('cf_active_studio_agents');
            if (raw) {
                selected = JSON.parse(raw);
                console.log("FlowEngine: Loaded selected agents from localStorage:", selected);
            } else {
                console.log("FlowEngine: Using default agents for studio:", studioId);
                if (studioId === 'cmr') selected = ['director','scrittore','musicale','consulente','visual','prezzi','sistema','cipher','bughunter','personaggi','orchestra','beta_reader','critic'];
                else if (studioId === 'apps') selected = ['director','sistema','cipher','bughunter_fixer','visual','dev','consulente','video_analyst'];
                else selected = ['director', 'scrittore', 'visual']; // Generic fallback
            }
        } catch(e) { 
            console.error("FlowEngine: Error parsing selected agents:", e);
            selected = ['director','scrittore','visual']; // Fallback on error
        }

        const allAgents = window.AGENTS_DATA || [];
        console.log("FlowEngine: window.AGENTS_DATA size:", allAgents.length);
        
        // Final fallback: if no selection, show all active agents
        if (!selected || selected.length === 0) {
            selected = allAgents.map(a => a.id);
            console.log("FlowEngine: Defaulted to all agents:", selected);
        }
        
        const agents = allAgents.filter(a => selected.includes(a.id));
        console.log("FlowEngine: Filtered agents count:", agents.length);
        
        const nodes = [];

        // 2. Add User Node at center
        const userNode = {
            id: 'user_me',
            x: savedPos['user_me']?.x || 500,
            y: savedPos['user_me']?.y || 500,
            label: profile.name || 'Tu',
            emoji: (profile.emoji && profile.emoji.startsWith('data:')) ? '📸' : (profile.emoji || '🦁'),
            color: 'var(--accent)',
            type: 'user'
        };
        nodes.push(userNode);

        // 2b. Add Developer Assistant (Antigravity)
        const devNode = {
            id: 'agent_dev_assist',
            name: 'Antigravity',
            icon: '♾️',
            role: 'Dev Assistant',
            status: 'run',
            x: savedPos['agent_dev_assist']?.x || 650,
            y: savedPos['agent_dev_assist']?.y || 400,
            type: 'agent',
            color: 'blue'
        };
        nodes.push(devNode);

        // 3. Add Agent Nodes in radial layout if no saved pos
        const centerX = 400;
        const centerY = 250;
        const radius = 180;

        this.nodes = [userNode];
        agents.forEach((agent, i) => {
            const angle = (i / agents.length) * Math.PI * 2;
            const node = {
                id: agent.id,
                x: savedPos[agent.id]?.x || (centerX + radius * Math.cos(angle)),
                y: savedPos[agent.id]?.y || (centerY + radius * Math.sin(angle)),
                label: agent.role,
                emoji: agent.icon,
                color: agent.color === 'pink' ? 'var(--pink)' : (agent.color === 'blue' ? 'var(--blue)' : (agent.color === 'green' ? 'var(--green)' : 'var(--orange)')),
                status: agent.status,
                type: 'agent'
            };
            this.nodes.push(node);
        });

        // 4. Create Links (all connected to user)
        this.links = agents.map(agent => ({
            source: agent.id,
            target: 'user_me',
            status: agent.status
        }));

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
            if (!s || !t) return '';
            
            const isActive = link.status === 'run';
            const stroke = isActive ? 'var(--accent)' : 'var(--border)';
            const opacity = isActive ? '0.6' : '0.3';
            
            return `
                <path d="M ${s.x} ${s.y} L ${t.x} ${t.y}" stroke="${stroke}" stroke-width="2" fill="none" opacity="${opacity}" marker-end="url(#arrowhead)" />
                ${isActive ? `
                <circle r="3" fill="var(--accent)" style="filter:url(#glow)">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M ${s.x} ${s.y} L ${t.x} ${t.y}" begin="${i * 0.2}s" />
                </circle>` : ''}
            `;
        }).join('');

        // Render Nodes
        nodesLayer.innerHTML = this.nodes.map(node => `
            <g class="flow-node" transform="translate(${node.x}, ${node.y})" 
               style="cursor:grab;" 
               onmousedown="FlowEngine.startDrag(event, '${node.id}')"
               onclick="FlowEngine.showAgentStatus('${node.id}')">
                <circle r="28" fill="var(--bg2)" stroke="${node.color}" stroke-width="2" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1))" />
                <text y="6" text-anchor="middle" font-size="22px">${node.emoji}</text>
                <text y="42" text-anchor="middle" fill="var(--text)" font-size="9px" font-weight="700" style="text-transform:uppercase; letter-spacing:0.04em; pointer-events:none;">${node.label.split(' ')[0]}</text>
            </g>
        `).join('');
    },

    startDrag(e, id) {
        e.preventDefault();
        const node = this.nodes.find(n => n.id === id);
        if (!node) return;
        this.draggingNode = node;
        
        const svg = document.getElementById(this.canvasId);
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        this.offset.x = loc.x - node.x;
        this.offset.y = loc.y - node.y;
    },

    onDrag(e) {
        if (!this.draggingNode) return;
        
        const svg = document.getElementById(this.canvasId);
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        
        this.draggingNode.x = loc.x - this.offset.x;
        this.draggingNode.y = loc.y - this.offset.y;
        this.render();
    },

    stopDrag() {
        if (this.draggingNode) {
            this.savePositions();
            this.draggingNode = null;
        }
    },

    savePositions() {
        const studioId = localStorage.getItem('cf_active_studio') || 'cmr';
        const positions = {};
        this.nodes.forEach(n => {
            positions[n.id] = { x: n.x, y: n.y };
        });
        localStorage.setItem(`cf_flow_positions_${studioId}`, JSON.stringify(positions));
        console.log("FlowEngine: Positions saved for", studioId);
    },

    showAgentStatus(id) {
        if (this.draggingNode) return; // Don't show status while dragging
        
        if (id === 'user_me') {
            showToast("👋 Eccomi qui, sto coordinando tutto!");
            return;
        }

        const agent = (window.AGENTS_DATA || []).find(a => a.id === id);
        if (!agent) return;
        
        // Special interaction for Antigravity Dev Assistant
        if (id === 'agent_dev_assist') {
            const advice = [
                '👋 Ciao! Sono Antigravity. Il tuo studio è ora in modalità HUB operativo.',
                '💡 Puoi trascinare gli agenti sulla mappa per organizzare visivamente il workflow.',
                '✨ Ricorda di salvare la mappa con il tasto in alto se fai modifiche strutturali.',
                '🤖 Usa la Sala Comunicazione in basso per parlare con tutto il team contemporaneamente.'
            ];
            const r = advice[Math.floor(Math.random()*advice.length)];
            Swal.fire({
                title: '♾️ Antigravity Advice',
                text: r,
                icon: 'info',
                confirmButtonText: 'Capito, grazie!',
                toast: true,
                position: 'top-end',
                timer: 4000
            });
            return;
        }
        
        // Custom interaction: Director can suggest new agents
        if (id === 'director' && Math.random() > 0.1) {
            this.suggestNewAgent();
            return;
        }

        const statusMsgs = {
            'run': [
                "Sto elaborando i dati per il nuovo contenuto...",
                "Analizzando i trend del momento...",
                "Generando bozze creative...",
                "Ottimizzando la distribuzione sui social..."
            ],
            'done': [
                "Ho finito l'ultimo compito, pronto per altro!",
                "Check completato. Tutto in ordine.",
                "In attesa di nuove istruzioni dal Capo."
            ],
            'wait': [
                "Sto riflettendo sulla strategia...",
                "In pausa caffè, ma ti sento!",
                "Analisi profonda in corso..."
            ]
        };

        const msgs = statusMsgs[agent.status] || statusMsgs['done'];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        
        showToast(`🤖 ${agent.role}: "${msg}"`);
    },

    suggestNewAgent() {
        const suggestions = [
            { role: "Analista Ghostwriter", prompt: "Crea un agente che analizzi lo stile di scrittura dell'utente e suggerisca come renderlo più 'misterioso' e 'noir', in linea con il Pulse." },
            { role: "Cacciatore di Meme", prompt: "Un agente focalizzato sul trasformare i concetti seri del libro in format virali per TikTok, usando humor nero e visual glitch." },
            { role: "Architetto del Suono", prompt: "Crea un esperto di sound design che suggerisca playlist ambientali e glitch-pop da abbinare alla lettura dei capitoli." },
            { role: "SEO Futurologo", prompt: "Un agente che non guarda solo alle parole chiave di oggi, ma predice quali trend 'cyber-tech' esploderanno nei prossimi 3 mesi." }
        ];
        const sug = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        Swal.fire({
            title: '👑 Suggerimento del Capo Redattore',
            html: `
                <div style="text-align:left; font-size:0.9rem; color:var(--text);">
                    <p>"Ehi Capo, a mio parere ci serve un nuovo agente nel team. Pensavo a un <b>${sug.role}</b>."</p>
                    <div style="background:var(--bg3); padding:10px; border-radius:8px; margin-top:10px; border:1px dashed var(--border);">
                        <small style="color:var(--dim);">PROMPT CONSIGLIATO:</small><br>
                        <i>${sug.prompt}</i>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: '✨ Crea subito!',
            cancelButtonText: 'Magari dopo',
            confirmButtonColor: 'var(--accent)',
            background: 'var(--bg2)',
            color: 'var(--text)'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('newAgentPrompt').value = sug.prompt;
                openCreateAgentModal();
            }
        });
    }
};
