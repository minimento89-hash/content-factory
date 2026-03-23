/**
 * ForgeEngine - Core logic for Phase 8: Officina delle Idee
 * Handles AI brainstorming simulation and idea collection.
 */

const ForgeEngine = {
    ideas: [],
    isBrainstorming: false,
    
    // Agent Personas for Brainstorming
    agents: {
        visionary: { name: "Visionario", emoji: "✨", color: "var(--blue)" },
        analyst: { name: "Trend Analyst", emoji: "📉", color: "var(--purple)" },
        director: { name: "Regista", emoji: "🎬", color: "var(--accent)" }
    },

    init() {
        console.log("ForgeEngine: Initialized");
        this.renderIdeaList();
    },

    startBrainstorming(topic) {
        if (!topic || this.isBrainstorming) return;
        this.isBrainstorming = true;
        
        const container = document.getElementById('forgeChat');
        if (container) container.innerHTML = ''; // Clear previous chat
        
        this.addChatMessage("director", `Ottimo tema: "${topic}". Cominciamo il brainstorming. Visionario, cosa ne pensi?`);
        
        // Simulating Agent Loop
        setTimeout(() => this.addChatMessage("visionary", `Vedo un potenziale enorme! Potremmo esplorare il lato più astratto di "${topic}", magari con un tocco surrealista.`), 2000);
        setTimeout(() => this.addChatMessage("analyst", `I dati mostrano un trend in crescita per "${topic}" tra i 18-35 anni. Consiglio di puntare su ganci brevi e d'impatto.`), 4000);
        setTimeout(() => {
            this.addChatMessage("director", `Ricevuto. Ecco 3 concetti solidi basati su questo scambio.`);
            this.generateIdeas(topic);
            this.isBrainstorming = false;
        }, 6500);
    },

    addChatMessage(role, text) {
        const container = document.getElementById('forgeChat');
        if (!container) return;
        
        const agent = this.agents[role];
        const msg = document.createElement('div');
        msg.style.cssText = `display:flex; gap:10px; margin-bottom:15px; animation: slideInUp 0.4s ease-out;`;
        msg.innerHTML = `
            <div style="width:32px;height:32px;border-radius:50%;background:${agent.color}15;border:1px solid ${agent.color}40;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">${agent.emoji}</div>
            <div style="flex:1;">
                <div style="font-size:0.7rem;font-weight:800;color:${agent.color};margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em;">${agent.name}</div>
                <div style="font-size:0.82rem;line-height:1.5;color:var(--text);background:var(--bg3);padding:10px 14px;border-radius:0 14px 14px 14px;border:1px solid var(--border);">${text}</div>
            </div>
        `;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    },

    generateIdeas(topic) {
        const newIdeas = [
            { id: Date.now() + 1, title: `${topic}: Il lato oscuro`, hook: "Cosa non ti dicono mai su...", tag: "CURIOSITÀ" },
            { id: Date.now() + 2, title: `Guida Definitiva a ${topic}`, hook: "3 Segreti per dominare il mercato di...", tag: "TUTORIAL" },
            { id: Date.now() + 3, title: `${topic} nel 2030`, hook: "Ecco come cambierà tutto tra 4 anni.", tag: "FUTURE" }
        ];
        
        this.ideas = [...newIdeas, ...this.ideas];
        this.renderIdeaList();
    },

    renderIdeaList() {
        const container = document.getElementById('forgeIdeaList');
        if (!container) return;
        
        if (this.ideas.length === 0) {
            container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--dim);font-family:'DM Mono',monospace;font-size:0.7rem;">Nessuna idea generata. Inizia un brainstorming!</div>`;
            return;
        }
        
        container.innerHTML = this.ideas.map(idea => `
            <div class="card" style="margin-bottom:12px; padding:15px; border-left:3px solid var(--accent); animation: fadeIn 0.5s ease-out;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <span class="card-tag" style="background:var(--bg2); border:1px solid var(--border); font-size:0.55rem;">${idea.tag}</span>
                    <button onclick="ForgeEngine.promoteIdea(${idea.id})" style="padding:4px 8px; border-radius:6px; background:var(--bg3); border:1px solid var(--border); cursor:pointer; font-size:0.6rem; font-weight:700;">🚀 Promuovi</button>
                </div>
                <div style="font-weight:700; font-size:0.85rem; margin-bottom:4px;">${idea.title}</div>
                <div style="font-size:0.75rem; color:var(--dim); font-family:'DM Mono',monospace;">"${idea.hook}"</div>
            </div>
        `).join('');
    },

    promoteIdea(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (!idea) return;
        
        // Simulating interaction with Social Pipeline
        if (window.showToast) showToast(`✓ "${idea.title}" inviato in approvazione!`);
        
        // Remove from list after promotion
        this.ideas = this.ideas.filter(i => i.id !== id);
        this.renderIdeaList();
    }
};
