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
    } while (newPoseKey === maestroPoseKey);

    maestroPoseKey = newPoseKey;
};

const processBeat = (timestamp) => {
    if (!gameStarted || isGameLost) return;

    const timeSinceLastBeat = timestamp - lastBeatTime;

    if (timeSinceLastBeat >= BEAT_INTERVAL) {
        if (!playerHasActed) {
            loseLife('⏰ MUITO LENTO!');
        }
        generateNewBeat(timestamp);
        return;
    }

    if (!nextBeatScheduled || timestamp >= nextBeatScheduled - 16) {
        nextBeatScheduled = lastBeatTime + BEAT_INTERVAL;
    }
};

const generateNewBeat = (timestamp) => {
    if (!gameStarted || isGameLost) return;

    playerHasActed = false; // Reset for new beat
    
    const beatCount = Math.floor(timestamp / BEAT_INTERVAL);
    lastBeatTime = beatCount * BEAT_INTERVAL;
    nextBeatScheduled = lastBeatTime + BEAT_INTERVAL;

    BEAT_INTERVAL = calculateBeatInterval();

    if (isMaster) {
        generateNewPose();
        updateGameState();
    }

    rhythmIndicator.style.width = '0%';
};

const loseLife = (message) => {
    if (lives <= 0 || !gameStarted) return;
    lives--;
    combo = 0;
    updateScoreDisplay();
    showFeedback(message, 'text-red-500', 1000);

    gameContainer.classList.add('pulse-wrong');
    setTimeout(() => gameContainer.classList.remove('pulse-wrong'), 400);

    if (lives <= 0) {
        lives = 0;
        endGame();
    }
};

const calculateTiming = (timestamp) => {
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
        return {
            hit: false,
            msg: '❌ ERROU! ❌',
            score: 0
        };
    }
};