// =========================================================
// SECTION 7: INPUT AND GAME CONTROL HANDLERS
// =========================================================

const handleInput = (key) => {
    if (instructionsModal.style.display === 'flex') return;
    if (!gameStarted || isGameLost) return;
    if (playerHasActed) return; // Só permite uma ação por batida

    const poseToMatch = POSE_MAPPING[key];
    if (!poseToMatch) return;

    playerHasActed = true; // Marca que o jogador agiu nesta batida
    const timestamp = performance.now();

    // =======================================================
    // CORREÇÃO DO BUG:
    // Removemos o 'if (playerPoseKey !== poseToMatch)'
    // Agora, a animação SEMPRE reinicia, fazendo as imagens
    // estáticas aparecerem e as animações tocarem de novo.
    // =======================================================
    const localAnimState = playerAnimStates[currentPlayerId];
    if (localAnimState) {
        localAnimState.currentFrame = 0;
        localAnimState.lastFrameTime = timestamp;
    }

    // Atualiza a pose local (para resposta instantânea no 'main.js')
    playerPoseKey = poseToMatch;

    // --- Lógica de Acerto ---
    const isCorrectPose = poseToMatch === maestroPoseKey;

    // POSE ERRADA - Perde vida
    if (!isCorrectPose) {
        loseLife('❌ MOVIMENTO ERRADO!');
        updatePlayerState(); // Sincroniza (enviando a pose errada e a vida a menos)
        return;
    }

    // POSE CORRETA - Verifica o Timing
    const timing = calculateTiming(timestamp);

    if (timing.hit) {
        // Acerto Bom ou Excelente
        combo++;
        const comboBonus = combo > 1 ? Math.floor(combo * 0.5) : 0;
        const totalPoints = timing.score + comboBonus;
        score += totalPoints;

        showFeedback(timing.msg + (combo > 1 ? ` COMBO x${combo}` : ''), timing.color);
        gameContainer.classList.add(timing.pulse);
        setTimeout(() => gameContainer.classList.remove(timing.pulse), 400);

        increaseDifficulty();
    } else {
        // Pose correta, mas timing errado
        loseLife(timing.msg);
    }

    updateScoreDisplay();
    updatePlayerState(); // Sincroniza o acerto
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
        // O 'startGame' agora é só pelo botão/espaço
    } else {
        handleInput(inputKey);
    }
};

const handleButtonClick = (event) => {
    const key = event.currentTarget.dataset.key;
    if (!gameStarted && !isGameLost) {
        // O 'startGame' agora é só pelo botão/espaço
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
    maestroPoseKey = POSE_DEFINITION_KEYS[0]; // Começa com UP_ARMS
    playerPoseKey = POSE_DEFINITION_KEYS[0];  // Começa com UP_ARMS

    // Reseta as animações locais
    if (playerAnimStates[currentPlayerId]) {
        playerAnimStates[currentPlayerId].currentFrame = 0;
        playerAnimStates[currentPlayerId].lastFrameTime = lastBeatTime;
    }
    maestroAnimState.currentFrame = 0;
    maestroAnimState.lastFrameTime = lastBeatTime;


    document.addEventListener('keydown', handleKeyPress);
    document.querySelectorAll('.key-button').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    // Cancela qualquer loop antigo (caso o 'endGame' tenha deixado um rodando)
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    gameLoopId = requestAnimationFrame(gameLoop);
    showFeedback('🎵 VAMOS LÁ! 🎵', 'text-yellow-300', 1500);

    if (isMaster) {
        updateGameState();
    }
    updatePlayerState();
};

const endGame = () => {
    // Não cancelamos o 'gameLoop' aqui, pois ele precisa
    // continuar rodando para mostrar a animação de morte.
    // Apenas setamos os estados.
    gameStarted = false;
    isGameLost = true;
    lives = 0;
    playerHasActed = true; // Previne novas ações
    document.removeEventListener('keydown', handleKeyPress);

    // =======================================================
    // ATIVA A ANIMAÇÃO DE MORTE
    // =======================================================
    playerPoseKey = 'DEATH'; // 1. Define a pose local como "morte"

    // 2. Reseta o estado da animação local para a morte (começa do frame 0)
    const localAnimState = playerAnimStates[currentPlayerId];
    if (localAnimState) {
        localAnimState.currentFrame = 0;
        localAnimState.lastFrameTime = performance.now();
    }
    // =======================================================

    saveHighScore(score);
    updatePlayerState(); // Envia o estado final (isAlive: false, pose: 'DEATH')
    showFeedback('💀 GAME OVER! 💀', 'text-red-500', 3000);

    // Não precisamos mais desenhar no canvas aqui,
    // o 'gameLoop' fará isso por nós.
    /* (Removido)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ...
    */

    // Mostra o botão de start APENAS para o host
    if (isMaster) {
        startGameContainer.classList.remove('hidden');
        document.getElementById('start-game-hint').textContent = 'Pressione ESPAÇO ou clique para jogar novamente';
    }
};
