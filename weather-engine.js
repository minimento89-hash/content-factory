/**
 * Weather Engine v1.0 - Content Factory AI
 * Handles real-time weather data from Open-Meteo,
 * determines seasonal animations, and applies dynamic themes.
 */

const WeatherEngine = {
    config: {
        lat: 45.4642, // Milan
        lon: 9.1900,
        cacheKey: 'cf_weather_cache',
        cacheTTL: 30 * 60 * 1000, // 30 minutes
        autoThemeKey: 'cf_auto_theme_enabled',
        interval: null
    },

    icons: {
        clear: '☀️',
        clouds: '☁️',
        rain: '🌧️',
        snow: '❄️',
        storm: '⛈️',
        night: '🌙'
    },

    async init() {
        console.log("🌦️ WeatherEngine: Inizializzazione...");
        this.stop(); // Clear any existing interval
        
        const run = async () => {
            const data = await this.getWeatherData();
            if (data) {
                this.updateUI(data);
                const isAuto = localStorage.getItem(this.config.autoThemeKey);
                if (isAuto === 'true' || isAuto === true) {
                    this.applyDynamicTheme(data);
                } else {
                    console.log("🌦️ WeatherEngine: Auto-theme disattivato, salto applicazione tema.");
                }
                this.applySeasonalEffects();
            }
        };

        await run();
        this.config.interval = setInterval(run, this.config.cacheTTL);
    },

    stop() {
        if (this.config.interval) {
            clearInterval(this.config.interval);
            this.config.interval = null;
        }
        // Remove seasonal effects if desired (optional)
        const fx = document.getElementById('seasonalContainer');
        if (fx) fx.innerHTML = '';
        document.body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    },

    async getWeatherData() {
        // Check cache first
        const cache = localStorage.getItem(this.config.cacheKey);
        if (cache) {
            const parsed = JSON.parse(cache);
            if (Date.now() - parsed.ts < this.config.cacheTTL) {
                console.log("🌦️ WeatherEngine: Dati caricati dalla cache");
                return parsed.data;
            }
        }

        try {
            console.log("🌦️ WeatherEngine: Fetching nuovi dati meteo...");
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.config.lat}&longitude=${this.config.lon}&current_weather=true`;
            const response = await fetch(url);
            const raw = await response.json();
            
            const weather = {
                temp: Math.round(raw.current_weather.temperature),
                code: raw.current_weather.weathercode,
                isDay: raw.current_weather.is_day === 1,
                time: new Date().getHours()
            };

            const data = {
                temp: weather.temp,
                condition: this.mapCodeToCondition(weather.code, weather.isDay),
                isDay: weather.isDay,
                ts: Date.now()
            };

            localStorage.setItem(this.config.cacheKey, JSON.stringify({ ts: Date.now(), data }));
            return data;
        } catch (e) {
            console.error("🌦️ WeatherEngine: Errore fetch meteo", e);
            return null;
        }
    },

    mapCodeToCondition(code, isDay) {
        if (!isDay) return 'night';
        if (code <= 1) return 'clear';
        if (code <= 3) return 'clouds';
        if (code <= 48) return 'clouds'; // Fog
        if (code <= 67) return 'rain';
        if (code <= 77) return 'snow';
        if (code <= 82) return 'rain';
        if (code <= 86) return 'snow';
        if (code <= 99) return 'storm';
        return 'clear';
    },

    updateUI(data) {
        const tempEl = document.getElementById('weatherTemp');
        const condEl = document.getElementById('weatherCond');
        const iconEl = document.getElementById('weatherIcon');

        if (tempEl) tempEl.textContent = data.temp + '°';
        if (condEl) condEl.textContent = this.translateCondition(data.condition);
        if (iconEl) iconEl.textContent = this.icons[data.condition] || '☀️';
    },

    translateCondition(cond) {
        const dict = {
            clear: 'Sereno',
            clouds: 'Nuvoloso',
            rain: 'Pioggia',
            snow: 'Neve',
            storm: 'Temporale',
            night: 'Notte stellata'
        };
        return dict[cond] || cond;
    },

    applyDynamicTheme(data) {
        // This will be called if auto-theme is ON
        const root = document.documentElement;
        
        if (data.condition === 'night') {
            applyTheme('night'); // Call the existing theme function if available
        } else if (data.condition === 'rain' || data.condition === 'storm') {
            applyTheme('ocean');
        } else if (data.temp > 28) {
            applyTheme('rose');
        } else {
            applyTheme('light');
        }
    },

    applySeasonalEffects() {
        const month = new Date().getMonth(); // 0-11
        let season = 'spring';
        if (month >= 2 && month <= 4) season = 'spring';
        else if (month >= 5 && month <= 7) season = 'summer';
        else if (month >= 8 && month <= 10) season = 'autumn';
        else season = 'winter';

        console.log(`🍂 WeatherEngine: Stagione rilevata -> ${season}`);
        document.body.classList.add('season-' + season);
        
        // Add container for particles if it doesn't exist
        if (!document.getElementById('seasonalContainer')) {
            const container = document.createElement('div');
            container.id = 'seasonalContainer';
            container.className = 'seasonal-fx';
            document.body.appendChild(container);

            if (season === 'autumn') this.createParticles(container, '🍁', 15);
            if (season === 'winter') this.createParticles(container, '❄️', 20);
            if (season === 'spring') this.createParticles(container, '🌸', 12);
        }
    },

    createParticles(container, char, count) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = char;
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (Math.random() * 5 + 5) + 's';
            p.style.fontSize = (Math.random() * 10 + 15) + 'px';
            container.appendChild(p);
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => WeatherEngine.init());
