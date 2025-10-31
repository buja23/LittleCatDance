const START_BPM = 30;
const BPM_INCREASE_RATE = 5;
const SCORE_DIFFICULTY_THRESHOLD = 300;
const MAX_LIVES = 3;

const PERFECT_WINDOW = 100; // ±100ms timing accuracy for "EXCELENTE!"
const GOOD_WINDOW = 250;  // ±250ms timing accuracy for "BOM!"

const PERFECT_SCORE = 50;
const GOOD_SCORE = 20;

// Mantemos as chaves e o mapeamento de teclas
const POSE_DEFINITION_KEYS = ['UP_ARMS', 'DOWN_ARMS', 'SIDE_ARMS', 'CROSSED_ARMS'];

// Maps input keys to pose definitions
const POSE_MAPPING = {
    'ArrowUp': 'UP_ARMS', 'w': 'UP_ARMS',
    'ArrowDown': 'DOWN_ARMS', 's': 'DOWN_ARMS',
    'ArrowLeft': 'SIDE_ARMS', 'a': 'SIDE_ARMS',
    'ArrowRight': 'CROSSED_ARMS', 'd': 'CROSSED_ARMS',
};
const ALL_KEYS = Object.keys(POSE_MAPPING);
const PLAYER_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];

// Canvas and Figure positioning
const canvasWidth = 800;
const SPRITE_SCALE = 3; // O "Zoom" do pixel art

// =========================================================
// DEFINIÇÃO DOS SPRITES E ANIMAÇÕES
// =========================================================
// * src: O arquivo de sprite sheet
// * frameCount: Quantos frames tem essa animação
// * frameWidth: A LARGURA de UM frame (32)
// * frameHeight: A ALTURA de UM frame (32)
// * msPerFrame: A velocidade da animação
// * loop: (true) repete a animação, (false) toca uma vez e para
// =========================================================
const SPRITE_DATA = {
    // ---- Maestro (Usando os sprites do Finn como placeholder) ----
    MAESTRO: {
        'UP_ARMS': {
            src: 'Personagens/finn/cima.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'DOWN_ARMS': {
            src: 'Personagens/finn/baixo.png',
            frameCount: 4, // Animação
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true // <-- CORRIGIDO (para a dança continuar)
        },
        'SIDE_ARMS': {
            src: 'Personagens/finn/esquerda.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'CROSSED_ARMS': {
            src: 'Personagens/finn/direita.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'DEATH': {
            src: 'Personagens/finn/morte.png',
            frameCount: 7, // Animação
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: false // Correto (toca uma vez)
        }
    },
    // ---- Jogador (Finn) ----
    PLAYER: {
        'UP_ARMS': {
            src: 'Personagens/finn/cima.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'DOWN_ARMS': {
            src: 'Personagens/finn/baixo.png',
            frameCount: 4, // Animação
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true // <-- CORRIGIDO (para a dança continuar)
        },
        'SIDE_ARMS': {
            src: 'Personagens/finn/esquerda.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'CROSSED_ARMS': {
            src: 'Personagens/finn/direita.png',
            frameCount: 1, // Imagem estática
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: true
        },
        'DEATH': {
            src: 'Personagens/finn/morte.png',
            frameCount: 7, // Animação
            frameWidth: 32,
            frameHeight: 32,
            msPerFrame: 200,
            loop: false // Correto (toca uma vez)
        }
    }
};

// =========================================================
// CARREGAMENTO DAS IMAGENS
// =========================================================
// Este objeto será populado automaticamente em dom.js
const ALL_IMAGE_PATHS = {};

