// =========================================================
// SECTION 8: MAIN GAME LOOP AND INITIALIZATION
// =========================================================

const gameLoop = (timestamp) => {
    if (!gameStarted || isGameLost) return;
    if (instructionsModal.style.display === 'flex') {
        gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }

    // 1. Process Beat
    processBeat(timestamp);

    // 2. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Figures
    // Draw Maestro (centered at the top)
    const maestroAngles = POSE_DEFINITIONS[maestroPoseKey].arms;
    drawFigure(canvasWidth / 2, '#f97316', maestroAngles, "🎵 MAESTRO", '#fcd34d', figureY - 50);

    // Draw all players (below the maestro)
    const players = Object.entries(playersData).filter(([id, player]) => player.isAlive);
    const playerCount = players.length;

    if (playerCount > 0) {
        // Calculate positions for multiple players
        const playersY = figureY + 180; // Players positioned below maestro
        const startX = canvasWidth * 0.2;
        const endX = canvasWidth * 0.8;
        const spacing = playerCount > 1 ? (endX - startX) / (playerCount - 1) : 0;

        players.forEach(([id, player], index) => {
            const isYou = id === currentPlayerId;
            const playerPoseAngles = POSE_DEFINITIONS[player.pose || 'UP_ARMS'].arms;
            const xPos = playerCount === 1 ? canvasWidth / 2 : startX + (spacing * index);

            const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
            const labelColors = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f472b6'];
            const playerColor = colors[index % colors.length];
            const playerLabelColor = labelColors[index % labelColors.length];

            const label = isYou ? "👤 VOCÊ" : `👤 ${player.name}`;
            drawFigure(xPos, playerColor, playerPoseAngles, label, playerLabelColor, playersY);
        });
    } else {
        // Fallback: draw only current player centered below maestro
        const playerAngles = POSE_DEFINITIONS[playerPoseKey].arms;
        drawFigure(canvasWidth / 2, '#3b82f6', playerAngles, "👤 VOCÊ", '#60a5fa', figureY + 180);
    }

    // 4. Update Rhythm Indicator (progress bar)
    const timeElapsed = timestamp - lastBeatTime;
    const beatProgress = timeElapsed / BEAT_INTERVAL;
    
    let progress = Math.max(0, Math.min(1, beatProgress));
    let indicatorWidth = Math.floor(progress * 100);
    indicatorWidth = Math.max(0, Math.min(100, indicatorWidth));
    
    if (rhythmIndicator.style.width !== `${indicatorWidth}%`) {
        rhythmIndicator.style.width = `${indicatorWidth}%`;
    }
    
    // (Lógica de "miss" movida para processBeat)

    // 5. Next iteration
    gameLoopId = requestAnimationFrame(gameLoop);
};

// --- Initialization ---
window.onload = function () {
    const checkAuthReady = setInterval(() => {
        if (window.isAuthReady) {
            clearInterval(checkAuthReady);

            loadHighScore();
            updateScoreDisplay();

            const DEMO_MODE = false; // Must match the value in Firebase config
            if (DEMO_MODE && demoModeWarning) {
                demoModeWarning.classList.remove('hidden');
            }

            // --- Event Listeners ---
            
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
            
            // Game controls (Listeners são adicionados em startGame)

            // Initial message on canvas
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
        }
    }, 100);
};