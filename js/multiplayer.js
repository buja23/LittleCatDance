// =========================================================
// SECTION 4.5: MULTIPLAYER ROOM MANAGEMENT
// =========================================================

const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const createRoom = async () => {
    // ... (sem mudanças aqui) ...
    if (!window.doc || !window.setDoc) {
        alert('Sistema de salas não disponível no momento. Tente recarregar a página.');
        return;
    }
    const name = playerNameInput.value.trim() || 'Jogador';
    if (name.length === 0) {
        alert('Por favor, digite seu nome!');
        return;
    }
    const roomCode = generateRoomCode();
    currentRoomCode = roomCode;
    currentPlayerId = crypto.randomUUID();
    playerName = name;
    isMaster = true;
    try {
        roomRef = window.doc(window.db, `game_rooms/${roomCode}`);
        const roomData = {
            code: roomCode,
            created: Date.now(),
            masterId: currentPlayerId,
            gameState: {
                started: false,
                maestroPose: 'UP_ARMS',
                currentBPM: START_BPM,
                beatTime: 0,
                beatInterval: 60000 / START_BPM
            },
            players: {
                [currentPlayerId]: {
                    name: playerName,
                    score: 0,
                    lives: MAX_LIVES,
                    combo: 0,
                    pose: 'UP_ARMS',
                    isAlive: true,
                    lastUpdate: Date.now()
                }
            }
        };
        await window.setDoc(roomRef, roomData);
        joinedRoom(roomCode);
    } catch (e) {
        console.error('Error creating room:', e);
        alert('Erro ao criar sala. Tente novamente.');
    }
};

const joinRoom = async () => {
    // ... (sem mudanças aqui) ...
    if (!window.doc || !window.getDoc || !window.setDoc) {
        alert('Sistema de salas não disponível no momento. Tente recarregar a página.');
        return;
    }
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    const name = playerNameInput.value.trim() || 'Jogador';
    if (roomCode.length !== 6) {
        alert('Por favor, digite um código de sala válido (6 caracteres)!');
        return;
    }
    if (name.length === 0) {
        alert('Por favor, digite seu nome!');
        return;
    }
    try {
        roomRef = window.doc(window.db, `game_rooms/${roomCode}`);
        const roomSnap = await window.getDoc(roomRef);
        if (!roomSnap.exists()) {
            alert('Sala não encontrada! Verifique o código.');
            return;
        }
        currentRoomCode = roomCode;
        currentPlayerId = crypto.randomUUID();
        playerName = name;
        isMaster = false;
        const currentRoomData = roomSnap.data();
        const updatedPlayers = {
            ...currentRoomData.players,
            [currentPlayerId]: {
                name: playerName,
                score: 0,
                lives: MAX_LIVES,
                combo: 0,
                pose: 'UP_ARMS',
                isAlive: true,
                lastUpdate: Date.now()
            }
        };
        await window.setDoc(roomRef, { players: updatedPlayers }, { merge: true });
        joinedRoom(roomCode);
    } catch (e) {
        console.error('Error joining room:', e);
        alert('Erro ao entrar na sala. Tente novamente.');
    }
};

/**
* Função chamada toda vez que os dados da sala mudam no Firebase
*/
const onRoomSnapshot = (snapshot) => {
    if (!snapshot.exists()) {
        leaveRoom();
        alert('A sala foi fechada.');
        return;
    }

    const roomData = snapshot.data();
    playersData = roomData.players || {};

    // Sincroniza os animadores (Correto)
    const playerIdsInRoom = Object.keys(playersData);
    const animStateIds = Object.keys(playerAnimStates);
    for (const playerId of playerIdsInRoom) {
        if (!playerAnimStates[playerId]) {
            playerAnimStates[playerId] = {
                currentFrame: 0,
                lastFrameTime: performance.now()
            };
        }
    }
    for (const animId of animStateIds) {
        if (!playersData[animId]) {
            delete playerAnimStates[animId];
        }
    }

    updatePlayersListUI();

    // Verifica se o jogo terminou (um vencedor foi definido)
    if (roomData.gameState && roomData.gameState.ended) {
        if (gameStarted) {
            gameStarted = false;
            isGameLost = true;

            // O gameLoop (main.js) agora lida com a tela de "Game Over"

            const winner = roomData.gameState.winner;
            if (winner && currentPlayerId === winner.playerId) {
                showFeedback('🏆 VOCÊ VENCEU! 🏆', 'text-yellow-400', 3000);
            }
        }
        return; // Para a execução (o jogo acabou, espera o master reiniciar)
    }

    // Sincroniza o estado do jogo para quem NÃO é o Master
    if (!isMaster && roomData.gameState) {
        const gs = roomData.gameState;

        // Se o master iniciou o jogo, inicie o seu
        if (gs.started && !gameStarted) {
            startGame();
        }

        // =======================================================
        // CORREÇÃO 1: TIME SYNC (SINCRONIZAÇÃO DA BARRA)
        // =======================================================
        // Comparamos o 'beatTime' do master com o último que vimos.
        if (gs.beatTime !== lastMasterBeatTime) {
            // É uma nova batida!
            // Resetamos o NOSSO timer local para o NOSSO tempo atual.
            lastBeatTime = performance.now();

            // Guardamos o 'beatTime' do master para não resetar de novo.
            lastMasterBeatTime = gs.beatTime;

            // Permite que o jogador aja nesta nova batida
            playerHasActed = false;
        }
        // =======================================================

        // Sincroniza a pose do maestro e o BPM
        maestroPoseKey = gs.maestroPose || 'UP_ARMS';
        currentBPM = gs.currentBPM || START_BPM;
        BEAT_INTERVAL = gs.beatInterval || (60000 / START_BPM);
    }
};


const joinedRoom = (roomCode) => {
    // ... (sem mudanças aqui) ...
    currentRoomCodeDisplay.textContent = roomCode;
    lobbyScreen.classList.add('hidden');
    gameInfoBar.classList.remove('hidden');
    if (isMaster) {
        startGameContainer.classList.remove('hidden');
        document.getElementById('start-game-hint').textContent = 'Pressione ESPAÇO ou clique no botão';
    } else {
        startGameContainer.classList.add('hidden');
    }
    if (unsubscribeRoom) unsubscribeRoom();
    unsubscribeRoom = window.onSnapshot(roomRef, onRoomSnapshot);
    showFeedback('🎮 Conectado à sala!', 'text-green-400', 2000);
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 30px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('✅ Conectado!', canvasWidth / 2, canvas.height / 2 - 20);
    ctx.font = '20px Inter';
    ctx.fillStyle = '#d1d5db';
    if (isMaster) {
        ctx.fillText('Pressione ESPAÇO para começar', canvasWidth / 2, canvas.height / 2 + 20);
    } else {
        ctx.fillText('Aguardando o host iniciar o jogo...', canvasWidth / 2, canvas.height / 2 + 20);
    }
};

const updatePlayerState = async () => {
    // ... (sem mudanças aqui) ...
    if (!roomRef || !currentPlayerId) return;
    try {
        const updates = {};
        updates[`players.${currentPlayerId}.name`] = playerName;
        updates[`players.${currentPlayerId}.score`] = score;
        updates[`players.${currentPlayerId}.lives`] = lives;
        updates[`players.${currentPlayerId}.combo`] = combo;
        updates[`players.${currentPlayerId}.pose`] = playerPoseKey;
        updates[`players.${currentPlayerId}.isAlive`] = lives > 0;
        updates[`players.${currentPlayerId}.lastUpdate`] = Date.now();

        await window.updateDoc(roomRef, updates);

        // O Master verifica se há um vencedor
        if (isMaster) {
            const players = Object.values(playersData);
            const alivePlayers = players.filter(p => p.isAlive);

            if (alivePlayers.length === 1 && players.length > 1) {
                const winner = alivePlayers[0];
                const winnerId = Object.keys(playersData).find(key => playersData[key] === winner);

                await window.updateDoc(roomRef, {
                    'gameState.ended': true,
                    'gameState.winner': {
                        name: winner.name,
                        score: winner.score,
                        playerId: winnerId
                    }
                });
            }
        }
    } catch (e) {
        console.error('Error updating player state:', e);
    }
};

const updateGameState = async () => {
    if (!isMaster || !roomRef) return;
    try {
        const updates = {
            'gameState.started': gameStarted,

            // =======================================================
            // CORREÇÃO 2: RESET DO JOGO
            // =======================================================
            // Quando o master inicia o jogo, ele limpa o 'ended' e 'winner'
            // do jogo anterior.
            'gameState.ended': false,
            'gameState.winner': window.deleteField(), // Deleta o vencedor anterior
            // =======================================================

            'gameState.maestroPose': maestroPoseKey,
            'gameState.currentBPM': currentBPM,
            'gameState.beatTime': lastBeatTime, // Envia o (master) timestamp do beat
            'gameState.beatInterval': BEAT_INTERVAL
        };
        await window.updateDoc(roomRef, updates);
    } catch (e) {
        console.error('Error updating game state:', e);
    }
};

const leaveRoom = async () => {
    // ... (sem mudanças aqui) ...
    if (roomRef && currentPlayerId) {
        try {
            const roomSnap = await window.getDoc(roomRef);
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                const updatedPlayers = { ...roomData.players };
                delete updatedPlayers[currentPlayerId];

                await window.updateDoc(roomRef, {
                    players: updatedPlayers
                });
            }
        } catch (e) {
            console.error('Error removing player from room:', e);
        }
    }
    if (unsubscribeRoom) {
        unsubscribeRoom();
        unsubscribeRoom = null;
    }
    currentRoomCode = null;
    currentPlayerId = null;
    isMaster = false;
    roomRef = null;
    playersData = {};
    playerAnimStates = {};
    lobbyScreen.classList.remove('hidden');
    gameInfoBar.classList.add('hidden');
    startGameContainer.classList.add('hidden');
    if (gameStarted) {
        cancelAnimationFrame(gameLoopId);
        gameStarted = false;
    }
    if (isGameLost) {
        cancelAnimationFrame(gameLoopId);
        isGameLost = false;
    }
    showFeedback('👋 Você saiu da sala', 'text-gray-400', 2000);
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
};