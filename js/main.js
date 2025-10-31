// =========================================================
// SECTION 8: MAIN GAME LOOP AND INITIALIZATION
// =========================================================

/**
 * Atualiza o frame atual de todas as animações
 */
const updateAnimationStates = (timestamp) => {
    // 1. Atualiza o Maestro
    const maestroPose = maestroPoseKey;
    const maestroSpriteInfo = SPRITE_DATA.MAESTRO[maestroPose];
    if (timestamp - maestroAnimState.lastFrameTime > maestroSpriteInfo.msPerFrame) {
        // --- Lógica de Loop/Não-Loop ---
        const newFrame = maestroAnimState.currentFrame + 1;
        if (maestroSpriteInfo.loop === false) {
            // Não dá loop, trava no último frame
            maestroAnimState.currentFrame = Math.min(newFrame, maestroSpriteInfo.frameCount - 1);
        } else {
            // Dá loop
            maestroAnimState.currentFrame = newFrame % maestroSpriteInfo.frameCount;
        }
        maestroAnimState.lastFrameTime = timestamp;
    }

    // 2. Atualiza todos os jogadores
    for (const playerId in playerAnimStates) {
        const player = playersData[playerId];
        if (!player) continue; // Pula se o jogador não existe

        const animState = playerAnimStates[playerId];

        let playerPose; // Variável para guardar a pose
        // Define a pose com prioridade
        if (player.isAlive === false) {
            playerPose = 'DEATH'; // 1. Morte tem prioridade máxima
        } else if (playerId === currentPlayerId) {
            playerPose = playerPoseKey; // 2. "VOCÊ" usa a pose local instantânea
        } else {
            playerPose = player.pose || 'UP_ARMS'; // 3. Outros jogadores usam a pose do Firebase
        }

        const playerSpriteInfo = SPRITE_DATA.PLAYER[playerPose];
        if (!playerSpriteInfo) {
            console.warn(`SpriteInfo não encontrado para PLAYER ${playerPose}`);
            continue;
        }

        if (timestamp - animState.lastFrameTime > playerSpriteInfo.msPerFrame) {
            // --- Lógica de Loop/Não-Loop (Jogador) ---
            const newFrame = animState.currentFrame + 1;
            if (playerSpriteInfo.loop === false) {
                // Não dá loop, trava no último frame
                animState.currentFrame = Math.min(newFrame, playerSpriteInfo.frameCount - 1);
            } else {
                // Dá loop
                animState.currentFrame = newFrame % playerSpriteInfo.frameCount;
            }
            animState.lastFrameTime = timestamp;
        }
    }
};

// =========================================================
// O GAME LOOP PRINCIPAL
// =========================================================
const gameLoop = (timestamp) => {
    // Mantém o loop rodando mesmo se o jogo parar (para animar a morte)
    if (instructionsModal.style.display === 'flex') {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    // 1. Processa a lógica do beat (só se o jogo estiver rodando)
    if (gameStarted && !isGameLost) {
        processBeat(timestamp);
    }

    // 2. ATUALIZA O FRAME DAS ANIMAÇÕES
    updateAnimationStates(timestamp);

    // 3. Limpa o Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 4. Desenha as Figuras
    // =======================================================
    // POSIÇÕES Y CORRIGIDAS (Para o canvas de 800x600)
    // =======================================================
    const maestroBaseY = 250; // Posição Y para a base do Maestro (mais para cima)
    const playerBaseY = 550;  // Posição Y para a base dos Jogadores (perto do fundo)
    // =======================================================

    // Desenha o Maestro
    drawFigure('MAESTRO', maestroPoseKey, maestroAnimState, canvasWidth / 2, maestroBaseY, "🎵 MAESTRO", '#fcd34d');

    // Desenha TODOS os jogadores (vivos ou mortos)
    const startX = canvasWidth * 0.2;
    const endX = canvasWidth * 0.8;
    const allPlayers = Object.entries(playersData);
    const playerCount = allPlayers.length;
    const spacing = playerCount > 1 ? (endX - startX) / (playerCount - 1) : 0;

    allPlayers.forEach(([id, player], index) => {
        const isYou = id === currentPlayerId;

        let playerPose;
        if (player.isAlive === false) {
            playerPose = 'DEATH';
        } else if (isYou) {
            playerPose = playerPoseKey; // Pose local instantânea
        } else {
            playerPose = player.pose || 'UP_ARMS'; // Pose do Firebase
        }

        const animState = playerAnimStates[id];
        if (!animState) return; // Pula este jogador se o animador não está pronto

        const xPos = playerCount === 1 ? canvasWidth / 2 : startX + (spacing * index);

        const labelColors = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f472b6'];
        const playerLabelColor = labelColors[index % labelColors.length];
        const label = isYou ? "👤 VOCÊ" : `👤 ${player.name}`;

        // Desenha o jogador na posição Y correta
        drawFigure('PLAYER', playerPose, animState, xPos, playerBaseY, label, playerLabelColor);
    });

    // 5. Atualiza a Barra de Ritmo
    if (gameStarted && !isGameLost) {
        const timeElapsed = timestamp - lastBeatTime;
        const beatProgress = timeElapsed / BEAT_INTERVAL;
        let progress = Math.max(0, Math.min(1, beatProgress));
        let indicatorWidth = Math.floor(progress * 100);
        indicatorWidth = Math.max(0, Math.min(100, indicatorWidth));
        if (rhythmIndicator.style.width !== `${indicatorWidth}%`) {
            rhythmIndicator.style.width = `${indicatorWidth}%`;
        }
    } else {
        rhythmIndicator.style.width = '0%';
        G
    }

    // 6. Próximo frame
    gameLoopId = requestAnimationFrame(gameLoop);
};


/**
 * Função para carregar uma imagem
 */
const loadImage = (path) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            loadedImages[path] = img; // Salva a imagem usando o PATH como chave
            imagesLoadedCount++;
            console.log(`Carregada: ${path} (${imagesLoadedCount}/${totalImagesToLoad})`);
            resolve(img);
        };
        img.onerror = () => {
            console.error(`Falha ao carregar imagem: ${path}`);
            reject(new Error(`Failed to load image: ${path}`));
        };
    });
};

// =========================================================
// INICIALIZAÇÃO (Quando a página carrega)
// =========================================================
window.onload = function () {
    const checkAuthReady = setInterval(async () => {
        if (window.isAuthReady) {
            clearInterval(checkAuthReady);

            // --- 1. Carrega todas as imagens ---
            const imageLoadPromises = [];
            for (const path in ALL_IMAGE_PATHS) {
                imageLoadPromises.push(loadImage(path));
            }

            try {
                // Mostra a tela de carregamento no canvas
                ctx.fillStyle = '#374151';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fcd34d';
                ctx.font = 'bold 30px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('Carregando Sprites...', canvas.width / 2, canvas.height / 2);

                await Promise.all(imageLoadPromises);
                console.log('Todas as imagens carregadas!');

                // --- 2. Jogo está pronto ---
                loadHighScore();
                updateScoreDisplay();

                const DEMO_MODE = false; // Must match the value in Firebase config
                if (DEMO_MODE && demoModeWarning) {
                    demoModeWarning.classList.remove('hidden');
                }

                // --- 3. Adiciona os Event Listeners ---
                // Modal
                showInstructionsButton.addEventListener('click', openInstructions);
                closeInstructionsButton.addEventListener('click', closeInstructions);
                instructionsModal.addEventListener('click', (e) => {
                    if (e.target === instructionsModal) {
                        closeInstructions();
                    }
                });

                // Multiplayer
                createRoomBtn.addEventListener('click', createRoom);
                joinRoomBtn.addEventListener('click', joinRoom);
                leaveRoomBtn.addEventListener('click', leaveRoom);

                // Start game
                startGameBtn.addEventListener('click', startGame);

                // Space key to start
                document.addEventListener('keydown', (e) => {
                    if (!gameStarted && !isGameLost && currentRoomCode && e.key === ' ' && isMaster) {
                        e.preventDefault();
                        startGame();
                    }
                });

                // Enter key to join
                roomCodeInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') joinRoom();
                });
                playerNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        if (roomCodeInput.value.trim()) {
                            joinRoom();
                        } else {
                            createRoom();
                        }
                    }
                });

                // --- 4. Desenha a Tela Inicial ---
                ctx.fillStyle = '#374151';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fcd34d';
                ctx.font = 'bold 35px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('🎵 LITTLE CAT DANCE 🎵', canvas.width / 2, canvas.height / 2 - 60);
                ctx.font = '22px Inter';
                ctx.fillStyle = '#d1d5db';
                ctx.fillText('Modo Multiplayer Online', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillStyle = '#fbbf24';
                ctx.font = 'bold 18px Inter';
                ctx.fillText('👆 Crie ou entre em uma sala acima', canvas.width / 2, canvas.height / 2 + 30);
                ctx.fillStyle = '#9ca3af';
                ctx.font = '16px Inter';
                ctx.fillText('Compartilhe o código com seus amigos!', canvas.width / 2, canvas.height / 2 + 60);

                // --- 5. Inicia o Game Loop (para desenhar a tela inicial) ---
                // Isso permite que a tela de 'Game Over' seja animada
                gameLoopId = requestAnimationFrame(gameLoop);

            } catch (error) {
                console.error("Erro ao carregar imagens:", error);
                alert("Erro ao carregar os recursos do jogo. Verifique o console.");
            }
        }
    }, 100);
};

