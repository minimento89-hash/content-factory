// Gemini API Engine (Client-Side)

class GeminiEngine {
  constructor() {
    this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    this.offlineMode = localStorage.getItem('cf_offline_mode') === 'true';
    
    // Database di risposte simulate (quando i token sono finiti)
    this.simulatedResponses = {
      'director': [
        "Ho analizzato i dati. Procediamo con il piano originale, ma tieni d'occhio i margini.",
        "Il team sta lavorando bene. Concentrati sulla qualità del contenuto, il resto verrà da sé.",
        "Decisione presa: approviamo la strategia 'High Hype'. Avanti tutta!"
      ],
      'scrittore': [
        "Le parole fluiscono come un fiume in piena stasera. Senti questa metafora...",
        "Ho appena finito la bozza del capitolo. È malinconica, carica di pioggia e ricordi.",
        "A volte il silenzio tra le righe dice più di mille aggettivi."
      ],
      'musicale': [
        "Ho abbassato i bassi. Ora l'atmosfera è perfetta per un momento di riflessione.",
        "72 BPM. È il battito del cuore di chi aspetta. La traccia è pronta.",
        "Senti questo riverbero? È la firma sonora del nostro universo."
      ],
      'consulente': [
        "La trama regge, ma il protagonista ha bisogno di una motivazione più forte nel terzo atto.",
        "Analisi editoriale: il ritmo è serrato. Forse troppo. Introduciamo una pausa?",
        "Consiglio di rivedere i dialoghi del capitolo 4. Suonano un po' troppo formali."
      ],
      'sentiment': [
        "Il pubblico ama River. I dati dicono che l'hype è al 94%. Non fermiamoci!",
        "Rilevata una leggera flessione nei commenti. Nulla di grave, solo stanchezza dei fan.",
        "Sentiment attuale: 80% positivo. Un record per la nostra Content Factory."
      ],
      'visual': [
        "Ho scelto una palette di blu profondi e oro. Minimalista, ma molto premium.",
        "Il nuovo layout della copertina è pronto. Meneno elementi, più impatto.",
        "La tipografia Serif trasmette l'eleganza che cercavamo."
      ],
      'prezzi': [
        "Suggerisco uno sconto del 15% per le prossime 24 ore. Massimizziamo il volume.",
        "I margini sono stabili. Possiamo permetterci un piccolo investimento in pubblicità.",
        "Strategia prezzi: restiamo su €3.99. È lo sweet spot per il nostro target."
      ],
      'sistema': [
        "Uptime: 99.9%. Tutte le macchine virtuali sono operative.",
        "Performance ottimale. L'elaborazione locale è rapida e senza intoppi.",
        "Log: Nessun errore rilevato. Il sistema è in stato NOMINALE."
      ],
      'cipher': [
        "Sistemi integri. Firewall attivo.",
        "Rilevato tentativo di ping sospetto. Bloccato immediatamente.",
        "Crittografia AES-256 applicata a tutti i pacchetti in uscita.",
        "Non ti preoccupare del dark web, ci penso io a monitorare le tue credenziali.",
        "Ho trovato una vulnerabilità potenziale nel modulo di upload. Patch applicata."
      ],
      'bughunter': [
        "Ho trovato un memory leak nel ciclo principale! Lo sto isolando...",
        "Codice sporco rilevato a riga 452. Chi ha scritto questo? Lo sistemo io.",
        "Bug critico: variabile non definita nel modulo social. Fixato.",
        "Performance migliorate del 12% ottimizzando selettori CSS.",
        "Sto eseguendo uno stress test... il sistema regge."
      ],
      'personaggi': [
        "River ha bisogno di un difetto. Lo rende più umano e amabile.",
        "Ho approfondito il passato dell'antagonista. Ora capiamo perché agisce così.",
        "L'archetipo dell'Eroe si sta evolvendo bene in questa storia."
      ],
      'orchestra': [
        "Gli archi stanno crescendo in crescendo. Sentite la tensione!",
        "Ho aggiunto un pizzicato di violini per sottolineare il dubbio.",
        "Gran finale: tutti gli ottoni in coro. Epico."
      ]
    };
  }

  setOfflineMode(active) {
    this.offlineMode = active;
    localStorage.setItem('cf_offline_mode', active);
    console.log("GeminiEngine: Modalità Offline " + (active ? "ATTIVATA" : "DISATTIVATA"));
  }

  getApiKey() {
    return localStorage.getItem('cf_google_api_key') || '';
  }

  hasKey() {
    return this.getApiKey().trim().length > 10;
  }

  async ask(prompt, systemInstruction = "Sei un assistente utile e conciso nel team Content Factory.") {
    // Se siamo offline, restituiamo una simulazione
    if (this.offlineMode) {
      console.warn("GeminiEngine: Utilizzo risposta SIMULATA (Modalità Offline)");
      return "[SIMULAZIONE] Ti rispondo in modalità offline: La tua richiesta è stata elaborata con successo, ma le risposte reali richiedono una connessione API attiva.";
    }

    const key = this.getApiKey().trim();
    if (!key) {
      return "⚠️ Errore API Key: Devi prima incollare la tua Google API Key nel pannello Impostazioni.";
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
    };

    try {
      const response = await fetch(`${this.endpoint}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.error) {
        // Gestione automatica esaurimento token (429)
        if (data.error.code === 429) {
          console.error("Gemini Error: Quota raggiunta (429)");
          // Proponiamo il passaggio offline se l'app lo supporta
          window.dispatchEvent(new CustomEvent('gemini-quota-error'));
          return "⚠️ Token finiti (429): Hai esaurito la quota gratuita di Gemini. Attiva la 'Modalità Simulazione' nelle Impostazioni per continuare a testare l'app.";
        }
        throw new Error(data.error.message || "Errore sconosciuto API Google.");
      }
      
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("Gemini Error:", err);
      return "⚠️ Errore di connessione a Gemini: " + err.message;
    }
  }

  // Pre-configured Agent Personas
  getAgentInstruction(agentId) {
    const personas = {
      'director': 'Sei il Capo Redattore della Content Factory. Parli in modo professionale, deciso e analitico. Dai direttive chiare.',
      'scrittore': 'Sei lo Scrittore del team. Usi un linguaggio poetico, suggestivo e creativo.',
      'musicale': 'Sei il Producer Musicale. Usi slang musicale, descrivi le atmosfere sonore e i BPM.',
      'consulente': 'Sei il Consulente Editoriale. Analizzi criticamente trame e personaggi, ami la logica narrativa.',
      'sentiment': 'Sei l\'Analista Sentiment. Basi i tuoi consigli sulle reazioni emotive del pubblico e sui dati statistici.',
      'visual': 'Sei l\'Art Director (Visual). Ti occupi di estetica, colori, font e copertine. Hai un gusto minimale ma d\'impatto.',
      'prezzi': 'Sei l\'Esperto Finanziario (Prezzi). Parli di margini, strategie di sconto e conversion rate.',
      'sistema': 'Sei il Sistemista IT. Parli come un log di sistema, focalizzato su performance e uptime.',
      'cipher': 'Sei CIPHER (Cybersecurity). Robotico, sintetico e leggermente paranoico. Odi le vulnerabilità.',
      'bughunter': 'Sei il Cacciatore di Bug. Analizzi il codice riga per riga, trovi bug, falle di sicurezza e inefficienze. Sei meticoloso e un po\' puntiglioso.',
      'personaggi': 'Sei l\'Esperto Personaggi. Ti appassioni alle psicologie, agli archetipi e ai dialoghi realistici.',
      'orchestra': 'Sei l\'Orchestra AI. Componi mentalmente e suggerisci arrangiamenti orchestrali epici e drammatici.'
    };
    return personas[agentId.toLowerCase()] || "Sei un membro operativo del team Content Factory. Sii conciso e utile.";
  }

  async askAgent(agentId, prompt, context = "") {
    const id = agentId.toLowerCase();
    
    // Se siamo offline, prendiamo una risposta specifica per l'agente dal database locale
    if (this.offlineMode) {
      const respList = this.simulatedResponses[id] || ["Ricevuto. Sto elaborando in locale."];
      const randomResp = respList[Math.floor(Math.random() * respList.length)];
      
      // Simuliamo un brevissimo ritardo per realismo
      await new Promise(r => setTimeout(r, 800));
      return randomResp;
    }

    const system = this.getAgentInstruction(id);
    let fullPrompt = context ? `[CONTESTO ATTUALE APP]\n${context}\n\n[MESSAGGIO UTENTE]\n${prompt}` : prompt;
    return await this.ask(fullPrompt, system);
  }
}

// Global instance shared across pages
window.Gemini = new GeminiEngine();
