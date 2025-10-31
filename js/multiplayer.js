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
    currentPlayerId = crypto.randomUUID(); // Unique ID per session/tab
    playerName = name;
    isMaster = true;

    try {
        // Create room document
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
        currentPlayerId = crypto.randomUUID(); // Unique ID per session/tab
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

const joinedRoom = (roomCode) => {
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

    unsubscribeRoom = window.onSnapshot(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
            leaveRoom();
            alert('A sala foi fechada.');
            return;
        }

        const roomData = snapshot.data();
        playersData = roomData.players || {};

        updatePlayersListUI();

        if (roomData.gameState && roomData.gameState.ended) {
            const winner = roomData.gameState.winner;
            if (gameStarted) {
                gameStarted = false;
                isGameLost = true;
                cancelAnimationFrame(gameLoopId);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fcd34d';
                ctx.font = 'bold 40px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('🏆 JOGO FINALIZADO! 🏆', canvas.width / 2, canvas.height / 2 - 60);
                ctx.fillStyle = 'white';
                ctx.font = '30px Inter';
                ctx.fillText(`${winner.name} venceu!`, canvas.width / 2, canvas.height / 2);
                ctx.font = '25px Inter';
                ctx.fillStyle = '#fcd34d';
                ctx.fillText(`Pontuação: ${winner.score}`, canvas.width / 2, canvas.height / 2 + 40);
                
                if (currentPlayerId === winner.playerId) {
                    showFeedback('🏆 VOCÊ VENCEU! 🏆', 'text-yellow-400', 3000);
                }
            }
            return;
        }

        if (!isMaster && roomData.gameState) {
            const gs = roomData.gameState;
            if (gs.started && !gameStarted) {
                startGame();
            }
            maestroPoseKey = gs.maestroPose || 'UP_ARMS';
            currentBPM = gs.currentBPM || START_BPM;
            BEAT_INTERVAL = gs.beatInterval || (60000 / START_BPM);
            lastBeatTime = gs.beatTime || performance.now();
        }
    });

    showFeedback('🎮 Conectado à sala!', 'text-green-400', 2000);

    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 30px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('✅ Conectado!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Inter';
    ctx.fillStyle = '#d1d5db';
    if (isMaster) {
        ctx.fillText('Pressione ESPAÇO para começar', canvas.width / 2, canvas.height / 2 + 20);
    } else {
        ctx.fillText('Aguardando o host iniciar o jogo...', canvas.width / 2, canvas.height / 2 + 20);
    }
};

const updatePlayerState = async () => {
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

        const players = Object.values(playersData);
        const alivePlayers = players.filter(p => p.isAlive);
        
        if (alivePlayers.length === 1 && alivePlayers[0].isAlive && players.length > 1) {
            const winner = alivePlayers[0];
            await window.updateDoc(roomRef, {
                'gameState.ended': true,
                'gameState.winner': {
                    name: winner.name,
                    score: winner.score,
                    playerId: Object.entries(playersData).find(([_, p]) => p === winner)[0]
                }
            });
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
            'gameState.maestroPose': maestroPoseKey,
            'gameState.currentBPM': currentBPM,
            'gameState.beatTime': lastBeatTime,
            'gameState.beatInterval': BEAT_INTERVAL
        };
        await window.updateDoc(roomRef, updates);
    } catch (e) {
        console.error('Error updating game state:', e);
    }
};

const leaveRoom = async () => {
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

    lobbyScreen.classList.remove('hidden');
    gameInfoBar.classList.add('hidden');
    startGameContainer.classList.add('hidden');

    if (gameStarted) {
        cancelAnimationFrame(gameLoopId);
        gameStarted = false;
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