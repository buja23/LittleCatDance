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

    // =======================================================
    // Sincroniza os estados de animação locais (playerAnimStates)
    // (A variável 'playerAnimStates' é definida em dom.js)
    // =======================================================
    const playerIdsInRoom = Object.keys(playersData);
    const animStateIds = Object.keys(playerAnimStates);

    // 1. Adiciona animadores para jogadores que entraram
    for (const playerId of playerIdsInRoom) {
        if (!playerAnimStates[playerId]) {
            // Cria um novo estado de animação local para este jogador
            playerAnimStates[playerId] = {
                currentFrame: 0,
                lastFrameTime: performance.now()
            };
        }
    }

    // 2. Remove animadores de jogadores que saíram
    for (const animId of animStateIds) {
        if (!playersData[animId]) {
            delete playerAnimStates[animId];
        }
    }
    // =======================================================

    updatePlayersListUI(); // Atualiza o placar

    // Verifica se o jogo terminou (um vencedor foi definido)
    if (roomData.gameState && roomData.gameState.ended) {
        const winner = roomData.gameState.winner;
        if (gameStarted) { // Se o jogo estava rodando para este cliente
            gameStarted = false;
            isGameLost = true; // Define como "perdido" para mostrar as animações finais

            // =======================================================
            // CORREÇÃO: Linha removida
            // Não paramos o gameLoop para que a animação de morte possa tocar.
            // cancelAnimationFrame(gameLoopId); 
            // =======================================================

            // O 'gameLoop' (em main.js) agora vai desenhar a tela de vencedor
            // baseado no 'isGameLost' e 'gameState.ended'

            if (currentPlayerId === winner.playerId) {
                showFeedback('🏆 VOCÊ VENCEU! 🏆', 'text-yellow-400', 3000);
            }
        }
        return; // Para a execução (o jogo acabou)
    }

    // Sincroniza o estado do jogo para quem não é o Master
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

    // Usa a nova função 'onRoomSnapshot' como callback
    unsubscribeRoom = window.onSnapshot(roomRef, onRoomSnapshot);

    showFeedback('🎮 Conectado à sala!', 'text-green-400', 2000);

    // Desenha a tela "Conectado"
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
    if (!roomRef || !currentPlayerId) return;
    try {
        // Usa 'updateDoc' com caminhos de campo para evitar sobrescrever
        // os dados de outros jogadores (evita 'race conditions')
        const updates = {};
        updates[`players.${currentPlayerId}.name`] = playerName;
        updates[`players.${currentPlayerId}.score`] = score;
        updates[`players.${currentPlayerId}.lives`] = lives;
        updates[`players.${currentPlayerId}.combo`] = combo;
        updates[`players.${currentPlayerId}.pose`] = playerPoseKey;
        updates[`players.${currentPlayerId}.isAlive`] = lives > 0;
        updates[`players.${currentPlayerId}.lastUpdate`] = Date.now();

        await window.updateDoc(roomRef, updates);

        // Verifica se há um vencedor (só o Master precisa fazer isso)
        if (isMaster) {
            const players = Object.values(playersData);
            const alivePlayers = players.filter(p => p.isAlive);

            // Se só há 1 jogador vivo (e há mais de 1 jogador na sala)
            if (alivePlayers.length === 1 && players.length > 1) {
                const winner = alivePlayers[0];
                // Encontra o ID do vencedor
                const winnerId = Object.entries(playersData).find(([id, p]) => p.name === winner.name)[0];

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
    playerAnimStates = {}; // Limpa os animadores locais

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

    // Desenha a tela inicial (lobby)
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
