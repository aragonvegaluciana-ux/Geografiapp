// DATA SECTION
// POOLS FOR GENERATION
const geographyPool = {
    continents: ['África', 'América', 'Asia', 'Europa', 'Oceanía', 'Antártida'],
    countries: [
        { name: 'Rusia', capital: 'Moscú', continent: 'Europa/Asia', difficulty: 1, language: 'Ruso' },
        { name: 'Canadá', capital: 'Ottawa', continent: 'América', difficulty: 1, language: 'Inglés/Francés' },
        { name: 'Brasil', capital: 'Brasilia', continent: 'América', difficulty: 1, language: 'Portugués' },
        { name: 'China', capital: 'Pekín', continent: 'Asia', difficulty: 1, language: 'Mandarín' },
        { name: 'Australia', capital: 'Canberra', continent: 'Oceanía', difficulty: 1, language: 'Inglés' },
        { name: 'India', capital: 'Nueva Delhi', continent: 'Asia', difficulty: 2, language: 'Hindi/Inglés' },
        { name: 'Egipto', capital: 'El Cairo', continent: 'África', difficulty: 2, language: 'Árabe' },
        { name: 'España', capital: 'Madrid', continent: 'Europa', difficulty: 1, language: 'Español' },
        { name: 'Francia', capital: 'París', continent: 'Europa', difficulty: 1, language: 'Francés' },
        { name: 'Alemania', capital: 'Berlín', continent: 'Europa', difficulty: 1, language: 'Alemán' },
        { name: 'Japón', capital: 'Tokio', continent: 'Asia', difficulty: 1, language: 'Japonés' },
        { name: 'México', capital: 'Ciudad de México', continent: 'América', difficulty: 1, language: 'Español' },
        { name: 'Argentina', capital: 'Buenos Aires', continent: 'América', difficulty: 1, language: 'Español' },
        { name: 'Sudáfrica', capital: 'Pretoria', continent: 'África', difficulty: 2, language: '11 idiomas oficiales' },
        { name: 'Turquía', capital: 'Ankara', continent: 'Asia/Europa', difficulty: 2, language: 'Turco' },
        { name: 'Islandia', capital: 'Reikiavik', continent: 'Europa', difficulty: 3, language: 'Islandés' },
        { name: 'Bután', capital: 'Timbu', continent: 'Asia', difficulty: 4, language: 'Dzongkha' },
        { name: 'Eritrea', capital: 'Asmara', continent: 'África', difficulty: 4, language: 'Tigriña/Árabe' },
        { name: 'Surinam', capital: 'Paramaribo', continent: 'América', difficulty: 3, language: 'Neerlandés' },
        { name: 'Vanuatu', capital: 'Port Vila', continent: 'Oceanía', difficulty: 5, language: 'Bislama/Francés/Inglés' },
        { name: 'Azerbaiyán', capital: 'Bakú', continent: 'Asia', difficulty: 3, language: 'Azerí' },
        { name: 'Estonia', capital: 'Tallin', continent: 'Europa', difficulty: 3, language: 'Estonio' },
        { name: 'Kirguistán', capital: 'Biskek', continent: 'Asia', difficulty: 5, language: 'Kirguís/Ruso' }
    ],
    rivers: ['Amazonas', 'Nilo', 'Misisipi', 'Danubio', 'Ganges', 'Yantzé'],
    mountains: ['Everest', 'K2', 'Aconcagua', 'Kilimanjaro', 'Mont Blanc']
};

function generateLesson(levelNumber) {
    // Niveles más largos: base 9 ejercicios (3 fases de 3), aumenta con nivel
    const phaseSize = 3 + Math.floor(levelNumber / 15);
    const numPhases = 3;
    const totalExercises = phaseSize * numPhases;
    
    const exercises = [];
    const difficultyLimit = Math.min(5, 1 + Math.floor(levelNumber / 15));
    const targetCountries = geographyPool.countries.filter(c => c.difficulty <= difficultyLimit);
    const usedQuestions = new Set();

    for (let p = 1; p <= numPhases; p++) {
        for (let i = 0; i < phaseSize; i++) {
            let exercise = null;
            let attempts = 0;
            
            while (!exercise && attempts < 100) {
                attempts++;
                const type = Math.random() > 0.4 ? 'multiple-choice' : 'true-false';
                const country = targetCountries[Math.floor(Math.random() * targetCountries.length)];
                let questionStr = "";
                let tempExercise = null;
                
                if (type === 'multiple-choice') {
                    const questionType = Math.random();
                    if (questionType < 0.5) {
                        questionStr = `¿Cuál es la capital de ${country.name}?`;
                        if (!usedQuestions.has(questionStr) || attempts > 80) {
                            const options = [country.capital];
                            while(options.length < 4) {
                                const opt = geographyPool.countries[Math.floor(Math.random() * geographyPool.countries.length)].capital;
                                if (!options.includes(opt)) options.push(opt);
                            }
                            tempExercise = {
                                type: 'multiple-choice',
                                phase: p,
                                question: `(Fase ${p}) ${questionStr}`,
                                options: options.sort(() => Math.random() - 0.5),
                                answer: country.capital
                            };
                        }
                    } else {
                        questionStr = `¿En qué continente está ${country.name}?`;
                        if (!usedQuestions.has(questionStr) || attempts > 80) {
                            const options = [...geographyPool.continents].sort(() => Math.random() - 0.5).slice(0, 4);
                            if (!options.includes(country.continent)) options[0] = country.continent;
                            tempExercise = {
                                type: 'multiple-choice',
                                phase: p,
                                question: `(Fase ${p}) ${questionStr}`,
                                options: options.sort(() => Math.random() - 0.5),
                                answer: country.continent
                            };
                        }
                    }
                } else {
                    const isFactTrue = Math.random() > 0.5;
                    const fakeCapital = geographyPool.countries[Math.floor(Math.random() * geographyPool.countries.length)].capital;
                    const displayCapital = isFactTrue ? country.capital : fakeCapital;
                    questionStr = `¿${displayCapital} es la capital de ${country.name}?`;
                    
                    if (!usedQuestions.has(questionStr) || attempts > 80) {
                        tempExercise = {
                            type: 'true-false',
                            phase: p,
                            question: `(Fase ${p}) ${questionStr}`,
                            options: ['Verdadero', 'Falso'],
                            answer: (displayCapital === country.capital) ? 'Verdadero' : 'Falso'
                        };
                    }
                }
                
                if (tempExercise) {
                    usedQuestions.add(questionStr);
                    exercise = tempExercise;
                }
            }
            
            if (exercise) {
                exercises.push(exercise);
            }
        }
    }

    return {
        id: `lv-${levelNumber}`,
        title: `Nivel ${levelNumber}: ${levelNumber % 5 === 0 ? 'Desafío Maestro' : 'Exploración'}`,
        exercises: exercises,
        totalPhases: numPhases
    };
}

class MusicManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.nodes = [];
        this.melodyTimeout = null;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.error("AudioContext not supported", e);
        }
    }

    start() {
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Entrada de volumen más presente
        this.masterGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 2);

        // Capa 1: Bajos profundos y estables (C2, G2)
        [65.41, 98.00].forEach((f, i) => this.createPad(f, i * 0.5, 'sine', 0.2));

        // Capa 2: Armonía media envolvente (C3, E3, G3)
        [130.81, 164.81, 196.00].forEach((f, i) => this.createPad(f, i * 0.8, 'triangle', 0.1));

        // Iniciar la melodía "aventurera"
        this.playMelody();
    }

    createPad(freq, delay, type, maxVol) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + delay);
        this.animateGain(gain, maxVol);
        this.nodes.push({ osc, gain });
    }

    animateGain(gainNode, maxVol) {
        if (!this.isPlaying) return;
        const now = this.ctx.currentTime;
        const duration = 4 + Math.random() * 4;
        gainNode.gain.linearRampToValueAtTime(maxVol, now + duration / 2);
        gainNode.gain.linearRampToValueAtTime(maxVol * 0.3, now + duration);

        setTimeout(() => {
            if (this.isPlaying) this.animateGain(gainNode, maxVol);
        }, duration * 1000);
    }

    playMelody() {
        if (!this.isPlaying) return;

        const now = this.ctx.currentTime;
        // Escala Pentatónica Mayor de Do (C, D, E, G, A) - Suena alegre y aventurero
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const freq = scale[Math.floor(Math.random() * scale.length)];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle'; // Sonido más brillante y llamativo
        osc.frequency.setValueAtTime(freq, now);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.2);

        // Ritmo: notas cada 0.5s, 1s o 1.5s para crear un patrón dinámico
        const delays = [500, 1000, 1500, 500];
        const nextDelay = delays[Math.floor(Math.random() * delays.length)];
        
        this.melodyTimeout = setTimeout(() => this.playMelody(), nextDelay);
    }

    playSuccess() {
        if (!this.statsEnabled() || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.4, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }

    playError() {
        if (!this.statsEnabled() || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    statsEnabled() {
        // Acceso indirecto a la configuración de música desde MusicManager
        return window.appInstance && window.appInstance.stats.musicEnabled;
    }

    stop() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        
        if (this.melodyTimeout) clearTimeout(this.melodyTimeout);
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
        
        setTimeout(() => {
            if (!this.isPlaying) {
                this.nodes.forEach(n => {
                    try { n.osc.stop(); } catch(e) {}
                });
                this.nodes = [];
            }
        }, 1600);
    }
}

const initialUserStats = {
    username: null,
    avatar: '🚀',
    xp: 0,
    lives: 5,
    streak: 0,
    level: 1,
    gems: 200,
    completedLessons: [],
    league: 'Bronce',
    inventory: {
        xpBoost: 0,
        streakFreeze: 0
    },
    hasLifeDoubler: false, // Propiedad obsoleta a eliminar en futuras migraciones
    darkMode: false,
    musicEnabled: true
};

const shopItems = [
    {
        id: 'streak-freeze',
        name: 'Protector de Racha',
        description: 'Mantiene tu racha si un día no practicas.',
        price: 200,
        icon: '❄️',
        color: '#1cb0f6'
    },
    {
        id: 'xp-boost',
        name: 'Doblador de XP',
        description: 'Gana el doble de XP en tu próxima lección.',
        price: 400,
        icon: '⚡',
        color: '#ff9600'
    },
    {
        id: 'life-refill',
        name: 'Recarga de Vidas',
        description: 'Recupera tus 5 vidas al instante.',
        price: 150,
        icon: '❤️',
        color: '#ff4b4b'
    }
];

const ranking = [
    { name: 'Sofía', xp: 1250, avatar: '👧', trend: 'up' },
    { name: 'Mateo', xp: 1100, avatar: '👦', trend: 'same' },
    { name: 'Tú', xp: 0, avatar: '🚀', trend: 'up' },
    { name: 'Lucía', xp: 950, avatar: '👩', trend: 'down' },
    { name: 'Diego', xp: 800, avatar: '👨', trend: 'same' },
    { name: 'Valentina', xp: 750, avatar: '👩‍🦰', trend: 'up' },
    { name: 'Joaquín', xp: 600, avatar: '👱‍♂️', trend: 'down' }
];

// APP LOGIC SECTION
class App {
    constructor() {
        this.currentView = 'learn';
        this.currentLesson = null;
        this.currentExerciseIndex = 0;
        this.selectedOption = null;
        this.stats = this.loadStats();
        
        // Inicializar el gestor de música
        this.music = new MusicManager();
        
        // Track session performance
        this.sessionCorrect = 0;
        this.sessionTotal = 0;
        
        this.init();
    }

    loadStats() {
        const saved = localStorage.getItem('geografiapp_stats');
        const stats = saved ? JSON.parse(saved) : { ...initialUserStats };
        
        // Migración: Asegurar que todos los campos nuevos existen
        return {
            ...initialUserStats,
            ...stats,
            inventory: {
                ...initialUserStats.inventory,
                ...(stats.inventory || {})
            }
        };
    }

    saveStats() {
        localStorage.setItem('geografiapp_stats', JSON.stringify(this.stats));
    }

    init() {
        if (!this.stats.username) {
            // Show onboarding
            const sidebar = document.getElementById('sidebar');
            const rightPanel = document.querySelector('.right-panel');
            if(sidebar) sidebar.style.display = 'none';
            if(rightPanel) rightPanel.style.display = 'none';
            
            this.setupOnboarding();
            this.switchView('onboarding');
            this.applyTheme();
            return;
        }

        const sidebar = document.getElementById('sidebar');
        const rightPanel = document.querySelector('.right-panel');
        if(sidebar) sidebar.style.display = '';
        if(rightPanel) rightPanel.style.display = '';

        this.renderPath();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.applyTheme();
        
        // Iniciar música en cualquier interacción para cumplir con las políticas del navegador
        const startMusic = () => {
            if (this.stats.musicEnabled) {
                this.music.start();
                // Una vez iniciada, quitamos estos listeners
                document.removeEventListener('click', startMusic);
                document.removeEventListener('keydown', startMusic);
            }
        };
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
    }

    setupOnboarding() {
        let selectedAvatar = '🚀';
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => {
                    o.classList.remove('selected');
                    o.style.borderColor = 'transparent';
                });
                opt.classList.add('selected');
                opt.style.borderColor = 'var(--primary-color)';
                selectedAvatar = opt.getAttribute('data-avatar');
            });
        });

        document.getElementById('btn-create-profile').addEventListener('click', () => {
            const nameInput = document.getElementById('onboarding-username').value.trim();
            if (!nameInput) {
                alert('Por favor, ingresa tu nombre para continuar.');
                return;
            }
            this.stats.username = nameInput;
            this.stats.avatar = selectedAvatar;
            this.saveStats();
            
            window.location.reload();
        });
    }

    applyTheme() {
        if (this.stats.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.addEventListener('click', () => {
                const page = li.getAttribute('data-page');
                this.switchView(page);
                document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
                li.classList.add('active');
            });
        });

        // Exit lesson
        const exitBtn = document.getElementById('exit-lesson');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                if (confirm('¿Seguro que quieres salir? Perderás tu progreso en esta lección.')) {
                    this.switchView('learn');
                }
            });
        }

        // Check Answer
        const checkBtn = document.getElementById('check-answer');
        if (checkBtn) {
            checkBtn.addEventListener('click', () => this.checkAnswer());
        }

        // Next Exercise
        const nextBtn = document.getElementById('next-exercise');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextExercise());
        }

        // Success Continue
        const successBtn = document.getElementById('success-continue');
        if (successBtn) {
            successBtn.addEventListener('click', () => {
                this.switchView('learn');
                this.renderPath();
            });
        }

        // Reset Data (Sidebar)
        const resetNavBtn = document.getElementById('nav-reset');
        if (resetNavBtn) {
            resetNavBtn.addEventListener('click', () => this.resetData());
        }

        // Start Next Lesson (Promo Card)
        const startNextBtn = document.getElementById('btn-start-next-lesson');
        if (startNextBtn) {
            startNextBtn.addEventListener('click', () => {
                const nextLevel = this.stats.completedLessons.length + 1;
                const lesson = generateLesson(nextLevel);
                this.startLesson(lesson);
            });
        }
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(`view-${viewId}`);
        const appContainer = document.getElementById('app');

        if (view) {
            view.classList.add('active');
            
            // Toggle lesson mode class for layout adjustments
            if (viewId === 'lesson' || viewId === 'success') {
                appContainer.classList.add('in-lesson');
            } else {
                appContainer.classList.remove('in-lesson');
            }

            if (viewId === 'leaderboard') this.renderLeaderboard();
            if (viewId === 'profile') this.renderProfile();
            if (viewId === 'shop') this.renderShop();
            if (viewId === 'more') this.renderMore();
        }
        this.currentView = viewId;
    }

    renderPath() {
        const container = document.getElementById('path-container');
        if (!container) return;
        
        const completedCount = this.stats.completedLessons.length;
        const totalToShow = completedCount + 5; // Siempre mostrar 5 niveles por delante
        
        container.innerHTML = `
            <div class="progress-details">
                Has completado ${completedCount} lecciones infinitas
            </div>
        `;

        for (let i = 1; i <= totalToShow; i++) {
            const isCompleted = i <= completedCount;
            const isLocked = i > completedCount + 1;
            const lessonId = `lv-${i}`;
            
            const node = document.createElement('div');
            node.className = `node ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`;
            
            const offset = (i % 2 === 0) ? '40px' : '-40px';
            node.style.marginLeft = offset;

            node.innerHTML = `
                <div class="node-label">Nivel ${i}</div>
                <i data-lucide="${isCompleted ? 'check' : (isLocked ? 'lock' : 'star')}"></i>
            `;

            if (!isLocked) {
                node.addEventListener('click', () => {
                    const lesson = generateLesson(i);
                    this.startLesson(lesson);
                });
            }

            container.appendChild(node);
        }
        if (window.lucide) lucide.createIcons();
    }

    renderLeaderboard() {
        const view = document.getElementById('view-leaderboard');
        if (!view) return;

        const sortedRanking = [...ranking];
        const userRank = sortedRanking.find(r => r.name === 'Tú');
        if (userRank) {
            userRank.xp = this.stats.xp;
            userRank.name = this.stats.username || 'Tú';
            userRank.avatar = this.stats.avatar || '🚀';
        }
        sortedRanking.sort((a, b) => b.xp - a.xp);

        view.innerHTML = `
            <div class="league-header">
                <div class="league-icon">🛡️</div>
                <div class="league-info">
                    <h2>Liga de ${this.stats.league || 'Bronce'}</h2>
                    <p>Faltan 3 días para que termine la liga</p>
                </div>
            </div>
            
            <div class="leaderboard-container">
                <div class="leaderboard-tabs">
                    <div class="tab active">Tu División</div>
                    <div class="tab">Global</div>
                </div>
                
                <div class="leaderboard-list">
                    <div class="promotion-zone-label">Zona de Ascenso</div>
                    ${sortedRanking.map((player, index) => {
                        const isUser = player.name === (this.stats.username || 'Tú');
                        const isPromotion = index < 3;
                        return `
                            <div class="leaderboard-item ${isUser ? 'user-row' : ''} ${isPromotion ? 'promotion' : ''}">
                                <span class="rank">${index + 1}</span>
                                <span class="avatar">${player.avatar}</span>
                                <div class="player-info">
                                    <span class="name">${player.name}</span>
                                    ${isUser ? '<span class="you-tag">TÚ</span>' : ''}
                                </div>
                                <div class="xp-container">
                                    <span class="xp-val">${player.xp}</span>
                                    <span class="xp-unit">XP</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="leaderboard-footer">
                <p>¡Los 3 mejores avanzan a la siguiente liga!</p>
            </div>
        `;
    }

    renderProfile() {
        const view = document.getElementById('view-profile');
        if (!view) return;

        view.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">${this.stats.avatar || '🚀'}</div>
                <h2>${this.stats.username || 'Estudiante'}</h2>
                <p>Nivel ${this.stats.level} Explorador</p>
                <div class="profile-league-badge">${this.stats.league}</div>
            </div>
            <div class="profile-stats-grid">
                <div class="stat-card">
                    <i data-lucide="zap"></i>
                    <strong>${this.stats.xp}</strong>
                    <span>XP Total</span>
                </div>
                <div class="stat-card">
                    <i data-lucide="flame"></i>
                    <strong>${this.stats.streak}</strong>
                    <span>Días de Racha</span>
                </div>
                <div class="stat-card">
                    <i data-lucide="award"></i>
                    <strong>${this.stats.completedLessons.length}</strong>
                    <span>Lecciones</span>
                </div>
            </div>

            <div class="profile-achievements">
                <h3>Tus Logros</h3>
                <div class="badges-grid">
                    ${this.renderBadge('Estrella de Explorador', '¡Has completado 5 niveles!', '⭐', this.stats.completedLessons.length >= 5, 'badge-star')}
                    ${this.renderBadge('Corona de Maestro', '¡Completaste 20 niveles!', '👑', this.stats.completedLessons.length >= 20, 'badge-crown')}
                    ${this.renderBadge('Cinta de Honor', 'Mantén una racha de 3 días', '🎖️', this.stats.streak >= 3, 'badge-honor')}
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }

    renderBadge(name, desc, icon, isUnlocked, extraClass = '') {
        return `
            <div class="badge-item ${isUnlocked ? '' : 'locked'}">
                ${isUnlocked ? '<div class="badge-shimmer"></div>' : ''}
                <div class="badge-icon ${extraClass}">${icon}</div>
                <div class="badge-name">${name}</div>
                <div class="badge-desc">${desc}</div>
            </div>
        `;
    }

    renderMore() {
        const view = document.getElementById('view-more');
        if (!view) return;

        view.innerHTML = `
            <h2 class="view-title">Configuración y Recursos</h2>
            
            <div class="settings-grid">
                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="moon"></i>
                        <div>
                            <h4>Tema Oscuro</h4>
                            <p>Cambia el aspecto de la aplicación</p>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${this.stats.darkMode ? 'checked' : ''} onchange="appInstance.toggleDarkMode()">
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="music"></i>
                        <div>
                            <h4>Música del Juego</h4>
                            <p>Efectos de sonido y ambiente</p>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${this.stats.musicEnabled ? 'checked' : ''} onchange="appInstance.toggleMusic()">
                        <span class="slider round"></span>
                    </label>
                </div>

                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="download"></i>
                        <div>
                            <h4>Guardar Datos</h4>
                            <p>Descarga tu progreso localmente</p>
                        </div>
                    </div>
                    <button class="btn-primary" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 8px; border: none; font-weight: bold; width: auto;" onclick="appInstance.exportData()">Exportar</button>
                </div>

                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="upload"></i>
                        <div>
                            <h4>Cargar Datos</h4>
                            <p>Restaura tu progreso desde un archivo</p>
                        </div>
                    </div>
                    <label class="btn-primary" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 8px; font-weight: bold; text-align: center; display: inline-block;">
                        Importar
                        <input type="file" accept=".json" style="display: none;" onchange="appInstance.importData(event)">
                    </label>
                </div>
            </div>

            <div class="languages-reference">
                <h3><i data-lucide="languages"></i> Idiomas del Mundo</h3>
                <p>Consulta el idioma oficial de los países que vas conociendo:</p>
                <div class="lang-table-container">
                    <table class="lang-table">
                        <thead>
                            <tr>
                                <th>País</th>
                                <th>Idioma Principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${geographyPool.countries.sort((a,b) => a.name.localeCompare(b.name)).map(c => `
                                <tr>
                                    <td>${c.name}</td>
                                    <td>${c.language}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }

    resetData() {
        const confirm1 = confirm("¿Estás seguro de que deseas reiniciar todo tu progreso? Se borrarán tus XP, gemas y niveles desbloqueados.");
        if (confirm1) {
            const confirm2 = confirm("¡Última oportunidad! Esta acción es irreversible. ¿Realmente quieres empezar de cero?");
            if (confirm2) {
                localStorage.removeItem('geografiapp_stats');
                window.location.reload();
            }
        }
    }

    toggleDarkMode() {
        this.stats.darkMode = !this.stats.darkMode;
        this.saveStats();
        this.applyTheme();
    }

    toggleMusic() {
        this.stats.musicEnabled = !this.stats.musicEnabled;
        this.saveStats();
        if (this.stats.musicEnabled) {
            this.music.start();
        } else {
            this.music.stop();
        }
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.stats));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "geografiapp_progreso.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedStats = JSON.parse(e.target.result);
                // Basic validation
                if (importedStats && typeof importedStats.xp !== 'undefined') {
                    this.stats = {
                        ...initialUserStats,
                        ...importedStats,
                        inventory: {
                            ...initialUserStats.inventory,
                            ...(importedStats.inventory || {})
                        }
                    };
                    this.saveStats();
                    alert("¡Progreso cargado exitosamente!");
                    window.location.reload();
                } else {
                    alert("El archivo no parece ser un guardado válido.");
                }
            } catch (error) {
                alert("Hubo un error al leer el archivo.");
            }
        };
        reader.readAsText(file);
    }

    renderShop() {
        const view = document.getElementById('view-shop');
        if (!view) return;

        view.innerHTML = `
            <div class="shop-header">
                <div class="shop-title-area">
                    <h2 class="view-title">Tienda de Exploradores</h2>
                    <p>Usa tus gemas para comprar potenciadores</p>
                </div>
                <div class="shop-gems-balance">
                    <span class="gem-icon">💎</span>
                    <span id="shop-gem-count">${this.stats.gems}</span>
                </div>
            </div>

            <div class="shop-grid">
                ${shopItems.map(item => `
                    <div class="shop-item-card" style="--item-color: ${item.color}">
                        <div class="item-icon-bg">${item.icon}</div>
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            ${item.id === 'xp-boost' ? `<span class="inventory-count">Tienes: ${this.stats.inventory.xpBoost}</span>` : ''}
                            ${item.id === 'streak-freeze' ? `<span class="inventory-count">Tienes: ${this.stats.inventory.streakFreeze}</span>` : ''}
                        </div>
                        <button class="btn-buy" onclick="appInstance.buyItem('${item.id}')">
                            <span class="gem-small">💎</span>
                            ${item.price}
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="inventory-section">
                <h3>Tus Objetos Activos</h3>
                <div class="active-items">
                    ${this.stats.inventory.xpBoost > 0 ? '<div class="active-badge boost">Doblador de XP Activo</div>' : ''}
                    ${this.stats.inventory.streakFreeze > 0 ? '<div class="active-badge freeze">Protector de Racha Equipado</div>' : ''}
                    ${this.stats.inventory.xpBoost === 0 && this.stats.inventory.streakFreeze === 0 ? '<p>No tienes objetos activos actualmente.</p>' : ''}
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }

    buyItem(itemId) {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return;

        if (this.stats.gems < item.price) {
            alert('¡No tienes suficientes gemas! Completa más lecciones para ganar algunas.');
            return;
        }

        // Apply item effect
        if (itemId === 'life-refill') {
            if (this.stats.lives === 5) {
                alert('Ya tienes tus vidas al máximo.');
                return;
            }
            this.stats.lives = 5;
        } else if (itemId === 'xp-boost') {
            this.stats.inventory.xpBoost++;
        } else if (itemId === 'streak-freeze') {
            this.stats.inventory.streakFreeze++;
        }

        this.stats.gems -= item.price;
        this.saveStats();
        this.updateStatsDisplay();
        this.renderShop();
        
        // Visual feedback
        const notification = document.createElement('div');
        notification.className = 'shop-notification';
        notification.innerText = `¡Has comprado ${item.name}!`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    startLesson(lesson) {
        this.currentLesson = lesson;
        this.currentExerciseIndex = 0;
        this.sessionCorrect = 0;
        this.sessionTotal = 0;
        this.stats.lives = 5;
        this.switchView('lesson');
        this.renderExercise();
        this.updateLessonProgress();
    }

    renderExercise() {
        const exercise = this.currentLesson.exercises[this.currentExerciseIndex];

        const container = document.getElementById('exercise-container');
        this.selectedOption = null;
        
        // Actualizar indicador de fase
        const phaseIndicator = document.getElementById('phase-indicator');
        if (phaseIndicator) {
            phaseIndicator.innerText = `Fase ${exercise.phase}/${this.currentLesson.totalPhases}`;
        }

        const checkBtn = document.getElementById('check-answer');
        if (checkBtn) {
            checkBtn.disabled = true;
            checkBtn.style.opacity = '0.5';
            checkBtn.classList.remove('hidden');
        }

        container.innerHTML = `
            <h2>${exercise.question}</h2>
            <div class="options-grid">
                ${exercise.options.map(opt => `
                    <div class="option-card" data-value="${opt}">${opt}</div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedOption = card.getAttribute('data-value');
                if (checkBtn) {
                    checkBtn.disabled = false;
                    checkBtn.style.opacity = '1';
                }
            });
        });

        const feedbackArea = document.getElementById('feedback-area');
        if (feedbackArea) feedbackArea.className = 'feedback-area hidden';
    }

    checkAnswer() {
        const exercise = this.currentLesson.exercises[this.currentExerciseIndex];
        const isCorrect = this.selectedOption === exercise.answer;
        
        const feedbackArea = document.getElementById('feedback-area');
        const checkBtn = document.getElementById('check-answer');
        
        this.sessionTotal++;
        if (isCorrect) this.sessionCorrect++;

        if (checkBtn) checkBtn.classList.add('hidden');
        if (feedbackArea) {
            feedbackArea.className = `feedback-area ${isCorrect ? 'correct' : 'incorrect'}`;
            document.getElementById('feedback-title').innerText = isCorrect ? '¡Excelente!' : 'Casi... la respuesta es:';
            document.getElementById('feedback-msg').innerText = isCorrect ? '¡Sigue así!' : exercise.answer;
        }

        if (isCorrect) {
            this.music.playSuccess();
            let xpGained = 20;
            if (this.stats.inventory.xpBoost > 0) {
                xpGained *= 2;
            }
            this.stats.xp += xpGained;
            this.saveStats();
        } else {
            this.music.playError();
            this.stats.lives--;
            this.updateStatsDisplay();
            if (this.stats.lives <= 0) {
                setTimeout(() => {
                    alert('¡Oh no! Te has quedado sin vidas. Inténtalo de nuevo o visita la tienda.');
                    this.switchView('learn');
                }, 1000);
            }
        }
    }

    nextExercise() {
        this.currentExerciseIndex++;
        if (this.currentExerciseIndex < this.currentLesson.exercises.length) {
            this.renderExercise();
            this.updateLessonProgress();
        } else {
            this.finishLesson();
        }
    }

    finishLesson() {
        if (!this.stats.completedLessons.includes(this.currentLesson.id)) {
            this.stats.completedLessons.push(this.currentLesson.id);
        }
        this.stats.streak = 1; 
        
        // Calcular precisión
        const precision = this.sessionTotal > 0 ? Math.round((this.sessionCorrect / this.sessionTotal) * 100) : 100;
        
        // Recompensa de gemas basada en precisión: 50 gemas base por 100%
        const gemsEarned = Math.floor((precision / 100) * 50);
        this.stats.gems += gemsEarned;

        let bonusXp = 50;
        if (this.stats.inventory.xpBoost > 0) {
            bonusXp *= 2;
            this.stats.inventory.xpBoost--; 
        }
        
        this.stats.xp += bonusXp; 
        this.saveStats();
        this.updateStatsDisplay();
        
        const precisionEl = document.getElementById('precision-value');
        if (precisionEl) precisionEl.innerText = `${precision}%`;

        const gemsEl = document.getElementById('gems-earned-value');
        if (gemsEl) gemsEl.innerText = `+${gemsEarned} Gemas`;

        this.switchView('success');
    }

    updateLessonProgress() {
        const pb = document.getElementById('lesson-progress');
        if (pb) {
            const progress = (this.currentExerciseIndex / this.currentLesson.exercises.length) * 100;
            pb.style.width = `${progress}%`;
        }
    }

    updateStatsDisplay() {
        const lifeCount = document.getElementById('life-count');
        const curLives = document.getElementById('current-lives');
        const streakCount = document.getElementById('streak-count');
        const gemCount = document.getElementById('gem-count');
        const xpDisplay = document.getElementById('right-panel-xp');
        const levelDisplay = document.getElementById('right-panel-level');

        if (lifeCount) {
            lifeCount.innerText = this.stats.lives;
            lifeCount.style.color = '';
        }
        if (curLives) curLives.innerText = this.stats.lives;
        if (streakCount) streakCount.innerText = this.stats.streak;
        if (gemCount) gemCount.innerText = this.stats.gems;
        if (xpDisplay) xpDisplay.innerText = this.stats.xp;
        if (levelDisplay) levelDisplay.innerText = this.stats.level;
    }
}

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    window.appInstance = new App();
});
