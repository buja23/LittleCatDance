// =========================================================
// SECTION 6: GAME STATE AND DIFFICULTY LOGIC
// =========================================================

const calculateBeatInterval = () => 60000 / currentBPM;

const increaseDifficulty = () => {
    if (score - lastDifficultyScore >= SCORE_DIFFICULTY_THRESHOLD) {
        currentBPM += BPM_INCREASE_RATE;
        lastDifficultyScore = score;
        BEAT_INTERVAL = calculateBeatInterval();
        showFeedback(`⚡ ${currentBPM} BPM! ⚡`, 'text-yellow-300', 1000);
    }
};

const generateNewPose = () => {
    // Only master/host generates new poses
    if (!isMaster) return;

    let newPoseKey;
    do {
        const randomIndex = Math.floor(Math.random() * POSE_DEFINITION_KEYS.length);
        newPoseKey = POSE_DEFINITION_KEYS[randomIndex];
    } while (newPoseKey === maestroPoseKey); // Evita repetir a pose

    maestroPoseKey = newPoseKey;
};

/**
 * Processa o que acontece a cada batida (beat)
 */
const processBeat = (timestamp) => {
    // Se o jogo não começou ou já acabou (mostrando a morte), não processe o beat.
    if (!gameStarted || isGameLost) return;

    const timeSinceLastBeat = timestamp - lastBeatTime;

    // Verifica se o tempo da batida já passou
    if (timeSinceLastBeat >= BEAT_INTERVAL) {
        // Se o tempo passou e o jogador não agiu, ele errou
        if (!playerHasActed) {
            loseLife('⏰ MUITO LENTO!');
        }
        // Gera a próxima batida
        generateNewBeat(timestamp);
        return;
    }

    // Agendamento (não é essencial, mas ajuda na precisão)
    if (!nextBeatScheduled || timestamp >= nextBeatScheduled - 16) {
        nextBeatScheduled = lastBeatTime + BEAT_INTERVAL;
    }
};

/**
 * Prepara a próxima batida
 */
const generateNewBeat = (timestamp) => {
    if (!gameStarted || isGameLost) return;

    playerHasActed = false; // Reseta a ação do jogador

    // Sincroniza o tempo da batida
    const beatCount = Math.floor(timestamp / BEAT_INTERVAL);
    lastBeatTime = beatCount * BEAT_INTERVAL;
    nextBeatScheduled = lastBeatTime + BEAT_INTERVAL;

    BEAT_INTERVAL = calculateBeatInterval(); // Recalcula (caso o BPM tenha mudado)

    // O Master/Host escolhe a próxima pose e reseta a animação
    if (isMaster) {
        const oldPose = maestroPoseKey;
        generateNewPose(); // Define o novo maestroPoseKey

        // Se a pose mudou, reseta a animação do maestro
        if (oldPose !== maestroPoseKey) {
            maestroAnimState.currentFrame = 0;
            maestroAnimState.lastFrameTime = timestamp;
        }

        updateGameState(); // Sincroniza com outros jogadores
    }

    // Reseta a barra de ritmo na UI
    rhythmIndicator.style.width = '0%';
};

/**
 * Remove uma vida do jogador
 */
const loseLife = (message) => {
    if (lives <= 0 || !gameStarted) return; // Não pode perder vida se já morreu
    lives--;
    combo = 0;
    updateScoreDisplay();
    showFeedback(message, 'text-red-500', 1000);

    // Efeito visual de erro
    gameContainer.classList.add('pulse-wrong');
    setTimeout(() => gameContainer.classList.remove('pulse-wrong'), 400);

    if (lives <= 0) {
        lives = 0;
        endGame(); // Chama o fim de jogo (de 'controls.js')
    }
};

/**
 * Calcula a pontuação do acerto
 */
const calculateTiming = (timestamp) => {
    // Calcula o quão longe o clique foi da "batida perfeita"
    // (A batida perfeita é no meio do 'BEAT_INTERVAL')
    const timeDiff = timestamp - lastBeatTime;
    const normalizedProgress = timeDiff / BEAT_INTERVAL;
    const deviation = Math.abs(normalizedProgress - 0.5) * BEAT_INTERVAL;

    if (deviation <= PERFECT_WINDOW) {
        return {
            hit: true,
            msg: '⭐ EXCELENTE! ⭐',
            score: PERFECT_SCORE,
            color: 'text-green-400',
            pulse: 'pulse-perfect'
        };
    } else if (deviation <= GOOD_WINDOW) {
        return {
            hit: true,
            msg: '👍 BOM! 👍',
            score: GOOD_SCORE,
            color: 'text-blue-400',
            pulse: 'pulse-perfect'
        };
    } else {
        // Se não foi 'Excelente' nem 'Bom', foi um erro.
        return {
            hit: false,
            msg: '❌ ERROU! ❌',
            score: 0
        };
    }
};
