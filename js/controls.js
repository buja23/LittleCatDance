// =========================================================
// SECTION 7: INPUT AND GAME CONTROL HANDLERS
// =========================================================

const handleInput = (key) => {
    if (instructionsModal.style.display === 'flex') return;
    if (!gameStarted || isGameLost) return;
    if (playerHasActed) return; // Only one action per beat

    const poseToMatch = POSE_MAPPING[key];
    if (!poseToMatch) return;

    playerHasActed = true;
    const timestamp = performance.now();
    const isCorrectPose = poseToMatch === maestroPoseKey;

    if (!isCorrectPose) {
        playerPoseKey = poseToMatch;
        loseLife('❌ MOVIMENTO ERRADO!');
        updatePlayerState();
        return;
    }

    playerPoseKey = poseToMatch;
    const timing = calculateTiming(timestamp);

    if (timing.hit) {
        combo++;
        const comboBonus = combo > 1 ? Math.floor(combo * 0.5) : 0;
        const totalPoints = timing.score + comboBonus;
        score += totalPoints;

        showFeedback(timing.msg + (combo > 1 ? ` COMBO x${combo}` : ''), timing.color);
        gameContainer.classList.add(timing.pulse);
        setTimeout(() => gameContainer.classList.remove(timing.pulse), 400);

        increaseDifficulty();
    } else {
        loseLife(timing.msg);
    }

    updateScoreDisplay();
    updatePlayerState();
};

const handleKeyPress = (event) => {
    let inputKey = event.key.toLowerCase();

    if (event.key.startsWith('Arrow')) {
        inputKey = event.key;
    }

    if (!POSE_MAPPING[inputKey]) return;

    if (instructionsModal.style.display === 'flex') {
        if (event.key === 'Escape') closeInstructions();
        return;
    }

    event.preventDefault();
    if (event.repeat) return;

    const button = document.querySelector(`.key-button[data-key="${inputKey}"]`) ||
        document.querySelector(`.key-button[data-key="${inputKey.toLowerCase()}"]`);
    if (button) {
        button.classList.add('!bg-yellow-400');
        setTimeout(() => button.classList.remove('!bg-yellow-400'), 150);
    }

    if (!gameStarted && !isGameLost) {
        //startGame(); // O start game agora é pelo botão/espaço
    } else {
        handleInput(inputKey);
    }
};

const handleButtonClick = (event) => {
    const key = event.currentTarget.dataset.key;
    if (!gameStarted && !isGameLost) {
        //startGame();
    } else {
        handleInput(key);
    }
};

const startGame = () => {
    if (gameStarted) return;
    if (!currentRoomCode) {
        alert('Você precisa estar em uma sala para jogar!');
        return;
    }

    gameStarted = true;
    isGameLost = false;
    startGameContainer.classList.add('hidden');

    // Reseta o estado local do jogador
    currentBPM = START_BPM;
    BEAT_INTERVAL = calculateBeatInterval();
    score = 0;
    combo = 0;
    lives = MAX_LIVES;
    lastDifficultyScore = 0;
    playerHasActed = false;

    updateScoreDisplay();
    lastBeatTime = performance.now();
    nextBeatScheduled = lastBeatTime + BEAT_INTERVAL;
    maestroPoseKey = POSE_DEFINITION_KEYS[0];
    playerPoseKey = POSE_DEFINITION_KEYS[0];

    document.addEventListener('keydown', handleKeyPress);
    document.querySelectorAll('.key-button').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    gameLoopId = requestAnimationFrame(gameLoop);
    showFeedback('🎵 VAMOS LÁ! 🎵', 'text-yellow-300', 1500);

    if (isMaster) {
        updateGameState();
    }
    updatePlayerState();
};

const endGame = () => {
    cancelAnimationFrame(gameLoopId);
    gameStarted = false;
    isGameLost = true;
    lives = 0;
    playerHasActed = true;
    document.removeEventListener('keydown', handleKeyPress);

    saveHighScore(score);
    updatePlayerState();
    showFeedback('💀 GAME OVER! 💀', 'text-red-500', 3000);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '25px Inter';
    ctx.fillStyle = '#fcd34d';
    ctx.fillText(`Sua Pontuação: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.font = '20px Inter';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('Esperando o Host reiniciar o jogo...', canvas.width / 2, canvas.height / 2 + 60);

    // Mostra o botão de start APENAS para o host
    if (isMaster) {
        startGameContainer.classList.remove('hidden');
        document.getElementById('start-game-hint').textContent = 'Pressione ESPAÇO ou clique para jogar novamente';
    }
};

// Esta função foi removida e substituída pela lógica em endGame e startGame
// const handleRestart = () => { ... };