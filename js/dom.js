     const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const gameContainer = document.getElementById('game-container');
        const scoreDisplay = document.getElementById('score-display');
        const livesDisplay = document.getElementById('lives-display');
        const comboDisplay = document.getElementById('combo-display');
        const bpmDisplay = document.getElementById('bpm-display');
        const highScoreDisplay = document.getElementById('high-score-display');
        const feedbackMessage = document.getElementById('feedback-message');
        const instructionsModal = document.getElementById('instructions-modal');
        const showInstructionsButton = document.getElementById('show-instructions');
        const closeInstructionsButton = document.getElementById('close-instructions');
        const rhythmIndicator = document.getElementById('rhythm-indicator');

        // Multiplayer DOM Elements
        const lobbyScreen = document.getElementById('lobby-screen');
        const gameInfoBar = document.getElementById('game-info-bar');
        const playerNameInput = document.getElementById('player-name-input');
        const roomCodeInput = document.getElementById('room-code-input');
        const joinRoomBtn = document.getElementById('join-room-btn');
        const createRoomBtn = document.getElementById('create-room-btn');
        const leaveRoomBtn = document.getElementById('leave-room-btn');
        const currentRoomCodeDisplay = document.getElementById('current-room-code');
        const playersCountDisplay = document.getElementById('players-count');
        const playersList = document.getElementById('players-list');
        const startGameContainer = document.getElementById('start-game-container');
        const startGameBtn = document.getElementById('start-game-btn');
        const demoModeWarning = document.getElementById('demo-mode-warning');

        // --- Game State Variables ---
        let currentBPM = START_BPM;
        let BEAT_INTERVAL = 60000 / currentBPM;

        let maestroPoseKey = 'UP_ARMS';
        let playerPoseKey = 'UP_ARMS';

        let score = 0;
        let highScore = 0;
        let combo = 0;
        let lives = MAX_LIVES;
        let lastDifficultyScore = 0;
        let playerHasActed = false;

        let gameLoopId = null;
        let lastBeatTime = 0;
        let gameStarted = false;
        let isGameLost = false;
        let nextBeatScheduled = 0;

        // --- Multiplayer State ---
        let currentRoomCode = null;
        let currentPlayerId = null;
        let playerName = '';
        let roomRef = null;
        let playersData = {}; // Store all players data
        let unsubscribeRoom = null;
        let isMaster = false; // If this player is the room master (controls game state)