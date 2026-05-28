import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLkz4mlGYwwGAo6lmFhyQKi8kkxaxENIo",
  authDomain: "geografiapp-feb0a.firebaseapp.com",
  projectId: "geografiapp-feb0a",
  storageBucket: "geografiapp-feb0a.firebasestorage.app",
  messagingSenderId: "144979359231",
  appId: "1:144979359231:web:8d70744b80bb449b3823ca",
  measurementId: "G-HMKQ8VX13V"
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

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

function generateLesson(levelNumber, stats = null) {
    // Niveles más largos: base 9 ejercicios (3 fases de 3), aumenta con nivel
    const phaseSize = 3 + Math.floor(levelNumber / 15);
    const numPhases = 3;
    const totalExercises = phaseSize * numPhases;
    
    const exercises = [];
    // Aumentar dificultad mucho más rápido (cada 3 niveles sube la dificultad máxima)
    const difficultyLimit = Math.min(5, 1 + Math.floor((levelNumber - 1) / 3));
    const targetCountries = geographyPool.countries.filter(c => c.difficulty <= difficultyLimit);
    
    const usedQuestionsLocal = new Set();
    const globallySeen = stats && stats.seenQuestions ? new Set(stats.seenQuestions) : new Set();

    for (let p = 1; p <= numPhases; p++) {
        for (let i = 0; i < phaseSize; i++) {
            let exercise = null;
            let attempts = 0;
            
            while (!exercise && attempts < 150) {
                attempts++;
                const type = Math.random() > 0.4 ? 'multiple-choice' : 'true-false';
                
                // Dar prioridad a países de la dificultad actual para que se sienta el aumento de nivel
                let country;
                if (attempts < 50 && targetCountries.some(c => c.difficulty === difficultyLimit)) {
                    const hardest = targetCountries.filter(c => c.difficulty === difficultyLimit);
                    country = hardest[Math.floor(Math.random() * hardest.length)];
                } else {
                    country = targetCountries[Math.floor(Math.random() * targetCountries.length)];
                }

                let questionStr = "";
                let tempExercise = null;
                
                if (type === 'multiple-choice') {
                    const questionType = Math.random();
                    if (questionType < 0.5) {
                        questionStr = `¿Cuál es la capital de ${country.name}?`;
                        // Solo usar si no se ha usado localmente. Preferir preguntas no vistas globalmente.
                        if (!usedQuestionsLocal.has(questionStr) && (!globallySeen.has(questionStr) || attempts > 80)) {
                            const options = [country.capital];
                            while(options.length < 4) {
                                const opt = geographyPool.countries[Math.floor(Math.random() * geographyPool.countries.length)].capital;
                                if (!options.includes(opt)) options.push(opt);
                            }
                            tempExercise = {
                                type: 'multiple-choice',
                                phase: p,
                                question: `(Fase ${p}) ${questionStr}`,
                                baseQuestion: questionStr, // Guardamos la pregunta sin la fase
                                options: options.sort(() => Math.random() - 0.5),
                                answer: country.capital
                            };
                        }
                    } else {
                        questionStr = `¿En qué continente está ${country.name}?`;
                        if (!usedQuestionsLocal.has(questionStr) && (!globallySeen.has(questionStr) || attempts > 80)) {
                            const options = [...geographyPool.continents].sort(() => Math.random() - 0.5).slice(0, 4);
                            if (!options.includes(country.continent)) options[0] = country.continent;
                            tempExercise = {
                                type: 'multiple-choice',
                                phase: p,
                                question: `(Fase ${p}) ${questionStr}`,
                                baseQuestion: questionStr,
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
                    
                    if (!usedQuestionsLocal.has(questionStr) && (!globallySeen.has(questionStr) || attempts > 80)) {
                        tempExercise = {
                            type: 'true-false',
                            phase: p,
                            question: `(Fase ${p}) ${questionStr}`,
                            baseQuestion: questionStr,
                            options: ['Verdadero', 'Falso'],
                            answer: (displayCapital === country.capital) ? 'Verdadero' : 'Falso'
                        };
                    }
                }
                
                if (tempExercise) {
                    usedQuestionsLocal.add(questionStr);
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
    seenQuestions: [],
    league: 'Bronce',
    inventory: {
        xpBoost: 0,
        streakFreeze: 0
    },
    hasLifeDoubler: false, // Propiedad obsoleta a eliminar en futuras migraciones
    darkMode: false,
    musicEnabled: true,
    friends: []
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
        this.stats = { ...initialUserStats };
        
        // Inicializar el gestor de música
        this.music = new MusicManager();
        
        // Track session performance
        this.sessionCorrect = 0;
        this.sessionTotal = 0;
    }

    async initializeApp() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.userId = user.uid;
                await this.loadStats();
                if (!this.stats.username) {
                    // Profile not created yet in DB
                }
                this.init();
            } else {
                this.userId = null;
                this.stats = { ...initialUserStats };
                
                const sidebar = document.getElementById('sidebar');
                const rightPanel = document.querySelector('.right-panel');
                if(sidebar) sidebar.style.display = 'none';
                if(rightPanel) rightPanel.style.display = 'none';
                
                this.setupOnboarding();
                this.switchView('onboarding');
                this.applyTheme();
            }
        });
    }

    async loadStats() {
        try {
            const docRef = doc(db, "users", this.userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const stats = docSnap.data();
                this.stats = {
                    ...initialUserStats,
                    ...stats,
                    seenQuestions: stats.seenQuestions || [],
                    inventory: {
                        ...initialUserStats.inventory,
                        ...(stats.inventory || {})
                    }
                };
            } else {
                const saved = localStorage.getItem('geografiapp_stats');
                if (saved) {
                    this.stats = { ...initialUserStats, ...JSON.parse(saved) };
                    await this.saveStats();
                } else {
                    this.stats = { ...initialUserStats };
                }
            }
        } catch (e) {
            console.error("Error cargando de Firebase, usando local", e);
            const saved = localStorage.getItem('geografiapp_stats');
            this.stats = saved ? { ...initialUserStats, ...JSON.parse(saved) } : { ...initialUserStats };
        }
    }

    async saveStats() {
        try {
            localStorage.setItem('geografiapp_stats', JSON.stringify(this.stats));
            if (this.stats.username) {
                await setDoc(doc(db, "users", this.userId), this.stats);
            }
        } catch (e) {
            console.error("Error guardando en Firebase", e);
        }
    }

    async addFriend(friendUsername) {
        if (!friendUsername || friendUsername.trim() === '') return;
        if (friendUsername === this.stats.username) {
            alert("No puedes agregarte a ti mismo.");
            return;
        }
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", friendUsername.trim()), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                alert("No se encontró ningún explorador con ese nombre.");
                return;
            }
            
            let friendId = null;
            querySnapshot.forEach((doc) => { friendId = doc.id; });
            
            if (this.stats.friends && this.stats.friends.includes(friendId)) {
                alert("Este explorador ya es tu amigo.");
                return;
            }
            
            if (!this.stats.friends) this.stats.friends = [];
            this.stats.friends.push(friendId);
            await this.saveStats();
            alert("¡Amigo agregado con éxito!");
            this.renderLeaderboard('friends');
        } catch (e) {
            console.error("Error agregando amigo", e);
            alert("Hubo un error al agregar al amigo.");
        }
    }

    init() {
        if (!this.stats.username) {
            return;
        }

        const sidebar = document.getElementById('sidebar');
        const rightPanel = document.querySelector('.right-panel');
        if(sidebar) sidebar.style.display = '';
        if(rightPanel) rightPanel.style.display = '';

        this.renderPath();
        if (!this.initialized) {
            this.setupEventListeners();
            this.initialized = true;
        }
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
        
        this.switchView('learn');
    }

    setupOnboarding() {
        let selectedAvatar = '🚀';
        document.querySelectorAll('.avatar-option').forEach(opt => {
            opt.onclick = () => {
                document.querySelectorAll('.avatar-option').forEach(o => {
                    o.classList.remove('selected');
                    o.style.borderColor = 'transparent';
                });
                opt.classList.add('selected');
                opt.style.borderColor = 'var(--primary-color)';
                selectedAvatar = opt.getAttribute('data-avatar');
            };
        });

        const tabLogin = document.getElementById('tab-login');
        const tabReg = document.getElementById('tab-register');
        const formLogin = document.getElementById('form-login');
        const formReg = document.getElementById('form-register');

        if(tabLogin) tabLogin.onclick = () => {
            tabLogin.classList.add('active');
            tabLogin.style.color = 'var(--primary-color)';
            tabLogin.style.borderBottomColor = 'var(--primary-color)';
            tabReg.classList.remove('active');
            tabReg.style.color = 'var(--text-secondary)';
            tabReg.style.borderBottomColor = 'transparent';
            formLogin.style.display = 'block';
            formReg.style.display = 'none';
        };

        if(tabReg) tabReg.onclick = () => {
            tabReg.classList.add('active');
            tabReg.style.color = 'var(--primary-color)';
            tabReg.style.borderBottomColor = 'var(--primary-color)';
            tabLogin.classList.remove('active');
            tabLogin.style.color = 'var(--text-secondary)';
            tabLogin.style.borderBottomColor = 'transparent';
            formReg.style.display = 'block';
            formLogin.style.display = 'none';
        };

        const btnLogin = document.getElementById('btn-login');
        if(btnLogin) btnLogin.onclick = async () => {
            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value;
            if(!email || !pass) return alert("Llena todos los campos.");
            try {
                await signInWithEmailAndPassword(auth, email, pass);
            } catch(e) {
                alert("Error al iniciar sesión: " + e.message);
            }
        };

        const btnReg = document.getElementById('btn-register');
        if(btnReg) btnReg.onclick = async () => {
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value;
            const name = document.getElementById('reg-username').value.trim();
            if(!email || !pass || !name) return alert("Llena todos los campos.");
            
            try {
                const cred = await createUserWithEmailAndPassword(auth, email, pass);
                this.userId = cred.user.uid;
                this.stats = { ...initialUserStats, username: name, avatar: selectedAvatar };
                await this.saveStats();
            } catch(e) {
                alert("Error al registrarse: " + e.message);
            }
        };
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
                const lesson = generateLesson(nextLevel, this.stats);
                this.startLesson(lesson);
            });
        }

        // Diploma Listeners
        const overlay = document.getElementById('diploma-overlay');
        const closeDiplomaBtn = document.getElementById('close-diploma');
        
        if (closeDiplomaBtn) {
            closeDiplomaBtn.addEventListener('click', () => overlay.classList.add('hidden'));
        }

        // Cerrar al hacer clic fuera del diploma
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.add('hidden');
            });
        }

        // Cerrar con la tecla Escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
                overlay.classList.add('hidden');
            }
        });
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
        const totalToShow = Math.min(10, completedCount + 5); 
        
        container.innerHTML = `
            <div class="progress-details">
                ${completedCount >= 10 ? '¡Has completado todos los niveles!' : `Has completado ${completedCount} lecciones`}
            </div>
        `;

        for (let i = 1; i <= Math.min(10, totalToShow); i++) {
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
                    const lesson = generateLesson(i, this.stats);
                    this.startLesson(lesson);
                });
            }

            container.appendChild(node);
        }
        if (window.lucide) lucide.createIcons();
    }

    async renderLeaderboard(activeTab = 'friends') {
        const view = document.getElementById('view-leaderboard');
        if (!view) return;

        const leagueConfig = {
            'Bronce':   { icon: '🥉', gradient: 'linear-gradient(135deg, #cd7f32, #ffb88c)', shadow: 'rgba(205,127,50,0.3)' },
            'Plata':    { icon: '🥈', gradient: 'linear-gradient(135deg, #9e9e9e, #e0e0e0)', shadow: 'rgba(158,158,158,0.3)' },
            'Oro':      { icon: '🥇', gradient: 'linear-gradient(135deg, #f9a825, #ffe082)', shadow: 'rgba(249,168,37,0.3)' },
            'Diamante': { icon: '💎', gradient: 'linear-gradient(135deg, #0288d1, #80deea)', shadow: 'rgba(2,136,209,0.3)' },
        };
        const league = this.stats.league || 'Bronce';
        const lc = leagueConfig[league] || leagueConfig['Bronce'];

        const now = new Date();
        const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
        const endDate = new Date(now);
        endDate.setDate(now.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 0);
        const msLeft = endDate - now;
        const hoursLeft = Math.floor(msLeft / 3600000);
        const minutesLeft = Math.floor((msLeft % 3600000) / 60000);
        const countdownStr = hoursLeft >= 24
            ? `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h restantes`
            : `${hoursLeft}h ${minutesLeft}m restantes`;

        let currentRanking = [];
        const userName = this.stats.username || 'Tú';

        if (activeTab === 'global') {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, orderBy("xp", "desc"), limit(50));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((d) => {
                    const data = d.data();
                    currentRanking.push({ name: data.username || 'Anónimo', xp: data.xp || 0, avatar: data.avatar || '🚀', trend: 'same' });
                });
            } catch (e) {
                console.error("Error fetching global leaderboard", e);
                currentRanking = [{ name: 'Error cargando datos', xp: 0, avatar: '❌', trend: 'same' }];
            }
        } else if (activeTab === 'friends') {
            currentRanking.push({ name: userName, xp: this.stats.xp, avatar: this.stats.avatar || '🚀', trend: 'same' });
            if (this.stats.friends && this.stats.friends.length > 0) {
                try {
                    const friendPromises = this.stats.friends.map(fid => getDoc(doc(db, "users", fid)));
                    const docs = await Promise.all(friendPromises);
                    docs.forEach(d => {
                        if (d.exists()) {
                            const data = d.data();
                            currentRanking.push({ name: data.username || 'Anónimo', xp: data.xp || 0, avatar: data.avatar || '🚀', trend: 'same' });
                        }
                    });
                } catch (e) {
                    console.error("Error fetching friends", e);
                }
            }
            currentRanking.sort((a, b) => b.xp - a.xp);
        }

        const maxXp = currentRanking[0]?.xp || 1;

        const trendIcon = (trend) => {
            if (trend === 'up')   return '<span class="trend trend-up">▲</span>';
            if (trend === 'down') return '<span class="trend trend-down">▼</span>';
            return '<span class="trend trend-same">—</span>';
        };

        const medalFor = (i) => {
            if (i === 0) return '<span class="medal medal-gold">🥇</span>';
            if (i === 1) return '<span class="medal medal-silver">🥈</span>';
            if (i === 2) return '<span class="medal medal-bronze">🥉</span>';
            return `<span class="rank-num">${i + 1}</span>`;
        };

        const top3 = currentRanking.slice(0, 3);
        const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
        const podiumHeights = top3[1] ? ['80px','110px','60px'] : ['0','110px','0'];
        const podiumPositions = [2, 1, 3];

        const renderPodiumItem = (player, heightIdx) => {
            if (!player) return '<div class="podium-slot empty"></div>';
            const isUser = player.name === userName;
            return `
                <div class="podium-slot ${isUser ? 'podium-user' : ''}">
                    <div class="podium-avatar">${player.avatar}</div>
                    <div class="podium-name">${player.name.length > 8 ? player.name.slice(0,7)+'…' : player.name}</div>
                    <div class="podium-xp">${player.xp} XP</div>
                    <div class="podium-bar" style="height:${podiumHeights[heightIdx]}">
                        <span class="podium-rank">${podiumPositions[heightIdx]}°</span>
                    </div>
                </div>
            `;
        };

        const userPosition = currentRanking.findIndex(p => p.name === userName);
        const isPromotion = userPosition < 3;
        const isDemotion = userPosition >= currentRanking.length - 2;

        let friendsUI = '';
        if (activeTab === 'friends') {
            friendsUI = `
                <div style="padding: 15px; text-align: center; background: var(--bg-card); border-radius: 12px; margin-bottom: 15px;">
                    <h3 style="margin-top:0; font-size: 1.2rem;">Añadir Amigo</h3>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <input type="text" id="friend-username-input" placeholder="Nombre de Explorador" style="padding: 10px; border-radius: 8px; border: 2px solid var(--border-color); flex:1; max-width:250px; font-family: inherit;">
                        <button id="btn-add-friend" class="btn-primary" style="padding: 8px 20px; width: auto; min-width: auto; height: auto;">Buscar y Añadir</button>
                    </div>
                </div>
            `;
        }

        view.innerHTML = `
            <div class="league-header" style="background: ${lc.gradient}; box-shadow: 0 8px 24px ${lc.shadow};">
                <div class="league-icon-wrap">
                    <div class="league-icon-big">${lc.icon}</div>
                </div>
                <div class="league-info">
                    <h2>Liga ${league}</h2>
                    <p class="league-countdown">⏱ ${countdownStr}</p>
                    ${activeTab !== 'friends' ? `
                    <div class="league-status-badges">
                        ${isPromotion ? '<span class="status-badge badge-promote">⬆ Zona de Ascenso</span>' : ''}
                        ${isDemotion && !isPromotion ? '<span class="status-badge badge-demote">⬇ Zona de Descenso</span>' : ''}
                        ${!isPromotion && !isDemotion ? '<span class="status-badge badge-safe">✔ Zona Segura</span>' : ''}
                    </div>` : ''}
                </div>
            </div>

            <div class="leaderboard-container">
                <div class="leaderboard-tabs">
                    <div class="tab ${activeTab === 'friends' ? 'active' : ''}" id="tab-friends">👥 Amigos</div>
                    <div class="tab ${activeTab === 'global' ? 'active' : ''}" id="tab-global">🌐 Global</div>
                </div>

                ${friendsUI}

                <!-- Podio -->
                <div class="podium-container">
                    ${podiumOrder.map((p, i) => renderPodiumItem(p, i)).join('')}
                </div>

                <!-- Lista completa -->
                <div class="leaderboard-list">
                    ${currentRanking.length > 3 ? '<div class="zone-label zone-middle">Clasificación General</div>' : ''}
                    ${currentRanking.map((player, index) => {
                        const isUser = player.name === userName;
                        const isPromZone = index < 3 && activeTab !== 'friends';
                        const isDemZone = index >= currentRanking.length - 2 && activeTab !== 'friends';
                        const barWidth = maxXp > 0 ? Math.max(4, Math.round((player.xp / maxXp) * 100)) : 4;
                        return `
                            <div class="leaderboard-item ${isUser ? 'user-row' : ''} ${isPromZone ? 'promotion' : ''} ${isDemZone && !isPromZone ? 'demotion' : ''}" style="animation-delay:${index * 0.05}s">
                                <div class="rank-col">${medalFor(index)}</div>
                                <span class="avatar">${player.avatar}</span>
                                <div class="player-info-col">
                                    <div class="player-name-row">
                                        <span class="name">${player.name}</span>
                                        ${isUser ? '<span class="you-tag">TÚ</span>' : ''}
                                        ${trendIcon(player.trend || 'same')}
                                    </div>
                                    <div class="xp-bar-wrap">
                                        <div class="xp-bar-fill" style="width: ${barWidth}%"></div>
                                    </div>
                                </div>
                                <div class="xp-container">
                                    <span class="xp-val">${player.xp.toLocaleString()}</span>
                                    <span class="xp-unit">XP</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${activeTab !== 'friends' ? '<div class="zone-label zone-demotion">⬇ Zona de Descenso (últimos 2)</div>' : ''}
                </div>
            </div>

            ${activeTab !== 'friends' ? `
            <div class="leaderboard-footer">
                <div class="footer-info">
                    <span>🏆 Top 3 ascienden a Liga ${league === 'Bronce' ? 'Plata' : league === 'Plata' ? 'Oro' : league === 'Oro' ? 'Diamante' : 'Maestro'}</span>
                    <span>💀 Últimos 2 descienden</span>
                </div>
            </div>` : ''}
        `;

        // Tabs funcionales
        document.getElementById('tab-global')?.addEventListener('click', () => this.renderLeaderboard('global'));
        document.getElementById('tab-friends')?.addEventListener('click', () => this.renderLeaderboard('friends'));

        const btnAddFriend = document.getElementById('btn-add-friend');
        if (btnAddFriend) {
            btnAddFriend.addEventListener('click', () => {
                const friendUsername = document.getElementById('friend-username-input').value;
                this.addFriend(friendUsername);
            });
        }

        // Animación de barras XP al cargar
        requestAnimationFrame(() => {
            document.querySelectorAll('.xp-bar-fill').forEach(bar => {
                bar.style.transition = 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
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
                
                <div class="profile-actions">
                    <button class="btn-edit" onclick="appInstance.showEditProfile()">
                        <i data-lucide="edit-3"></i> Editar Perfil
                    </button>
                    <button class="btn-primary" style="width: auto; padding: 10px 24px; background: var(--color-accent);" onclick="appInstance.showDiploma()">
                        <i data-lucide="award"></i> Probar Diploma
                    </button>
                    ${this.stats.completedLessons.length >= 10 ? `
                        <button class="btn-primary" style="width: auto; padding: 10px 24px;" onclick="appInstance.showDiploma()">
                            <i data-lucide="award"></i> Ver Diploma
                        </button>
                    ` : ''}
                    <button class="btn-secondary" style="width: auto; padding: 10px 24px; margin-top: 10px; border-color: #ff4b4b; color: #ff4b4b;" onclick="appInstance.signOut()">
                        <i data-lucide="log-out"></i> Cerrar Sesión
                    </button>
                </div>
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
                    ${this.renderBadge('Estrella de Explorador', '¡Has completado 3 niveles!', '⭐', this.stats.completedLessons.length >= 3, 'badge-star')}
                    ${this.renderBadge('Corona de Maestro', '¡Completaste 7 niveles!', '👑', this.stats.completedLessons.length >= 7, 'badge-crown')}
                    ${this.renderBadge('Cinta de Honor', 'Mantén una racha de 3 días', '🎖️', this.stats.streak >= 3, 'badge-honor')}
                    ${this.renderBadge('Graduado Mundial', '¡Llegaste al Nivel 10!', '📜', this.stats.completedLessons.length >= 10, 'badge-honor')}
                </div>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }

    showEditProfile() {
        const view = document.getElementById('view-profile');
        const avatars = ['🚀', '🌍', '🎓', '🌟', '🦒', '🦁', '🧭', '🗺️', '🚁', '⛴️'];
        
        view.innerHTML = `
            <div class="edit-profile-form">
                <h3>Editar Perfil</h3>
                <div class="form-group">
                    <label>Tu Nombre:</label>
                    <input type="text" id="edit-username" value="${this.stats.username}">
                </div>
                <div class="form-group">
                    <label>Elige tu Avatar:</label>
                    <div class="avatar-selection" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                        ${avatars.map(a => `
                            <div class="avatar-option ${this.stats.avatar === a ? 'selected' : ''}" 
                                 data-avatar="${a}" 
                                 onclick="appInstance.selectEditAvatar(this)"
                                 style="font-size: 2rem; padding: 10px; border: 2px solid ${this.stats.avatar === a ? 'var(--primary-color)' : 'transparent'}; border-radius: 12px; cursor: pointer; background: var(--bg-main); text-align: center;">
                                 ${a}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    <button class="btn-primary" onclick="appInstance.saveProfile()">Guardar Cambios</button>
                    <button class="btn-secondary" onclick="appInstance.renderProfile()" style="background: #eee; color: #555; box-shadow: 0 4px 0 #ccc;">Cancelar</button>
                </div>
            </div>
        `;
    }

    selectEditAvatar(el) {
        document.querySelectorAll('.edit-profile-form .avatar-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.style.borderColor = 'transparent';
        });
        el.classList.add('selected');
        el.style.borderColor = 'var(--primary-color)';
        this.tempAvatar = el.getAttribute('data-avatar');
    }

    saveProfile() {
        const newName = document.getElementById('edit-username').value.trim();
        if (!newName) {
            alert('El nombre no puede estar vacío.');
            return;
        }
        
        this.stats.username = newName;
        if (this.tempAvatar) {
            this.stats.avatar = this.tempAvatar;
        }
        this.saveStats();
        this.renderProfile();
        this.updateStatsDisplay();
    }

    showDiploma() {
        const overlay = document.getElementById('diploma-overlay');
        document.getElementById('diploma-user-name').innerText = this.stats.username || 'Explorador';
        
        const now = new Date();
        const options = { year: 'numeric', month: 'long' };
        document.getElementById('diploma-current-date').innerText = now.toLocaleDateString('es-ES', options);
        
        overlay.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    async downloadDiplomaImage() {
        const capture = document.getElementById('diploma-capture');
        if (!capture) return;

        try {
            const overlay = document.getElementById('diploma-overlay');
            overlay.classList.remove('hidden');

            const canvas = await html2canvas(capture, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            const link = document.createElement('a');
            link.download = `Diploma_Geografiapp_${this.stats.username || 'Explorador'}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (error) {
            console.error(error);
        }
    }

    async downloadDiplomaPDF() {
        const capture = document.getElementById('diploma-capture');
        if (!capture) return;

        const pdfBtn = document.getElementById('btn-download-pdf');
        const originalText = pdfBtn.innerHTML;
        pdfBtn.disabled = true;

        try {
            const overlay = document.getElementById('diploma-overlay');
            overlay.classList.remove('hidden');

            const canvas = await html2canvas(capture, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const jsPDFConstructor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            
            const pdf = new jsPDFConstructor({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const yPos = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', 0, yPos > 0 ? yPos : 0, pdfWidth, pdfHeight);
            
            const fileName = `Diploma_Geografiapp_${this.stats.username || 'Explorador'}.pdf`;
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error(error);
        } finally {
            pdfBtn.disabled = false;
        }
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
                        <i data-lucide="award"></i>
                        <div>
                            <h4>Modo Desarrollador</h4>
                            <p>Probar visualización del diploma</p>
                        </div>
                    </div>
                    <button class="btn-secondary" style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 8px; border: none; font-weight: bold; width: auto; background: var(--color-accent);" onclick="appInstance.showDiploma()">Probar Diploma</button>
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
                this.stats = { ...initialUserStats, username: this.stats.username, avatar: this.stats.avatar };
                this.saveStats().then(() => window.location.reload());
            }
        }
    }

    async signOut() {
        if (confirm("¿Seguro que quieres cerrar sesión?")) {
            await signOut(auth);
            window.location.reload();
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
            this.saveStats();
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
            
            // Añadir las preguntas de esta lección al historial global
            this.currentLesson.exercises.forEach(ex => {
                if (ex.baseQuestion && !this.stats.seenQuestions.includes(ex.baseQuestion)) {
                    this.stats.seenQuestions.push(ex.baseQuestion);
                }
            });
        }
        
        // Actualizar nivel basado en progreso
        this.stats.level = this.stats.completedLessons.length + 1;
        
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

        // Verificar si es el nivel 10 para el diploma
        if (this.stats.completedLessons.length === 10) {
            setTimeout(() => {
                alert('¡FELICIDADES! Has alcanzado el Nivel 10. ¡Ya puedes descargar tu Diploma de Maestro Explorador en tu perfil!');
                this.showDiploma();
            }, 1000);
        }
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
    window.appInstance.initializeApp();
});
