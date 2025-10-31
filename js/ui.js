// =========================================================
// SECTION 3: UTILITY FUNCTIONS (UI/MODAL)
// =========================================================

const openInstructions = () => {
    instructionsModal.style.display = 'flex';
    if (gameStarted) {
        cancelAnimationFrame(gameLoopId); // Pause the game loop
    }
};

const closeInstructions = () => {
    instructionsModal.style.display = 'none';
    if (gameStarted) {
        gameLoopId = requestAnimationFrame(gameLoop); // Resume the game loop
    }
};

// Modal event listeners (Executado no 09-main.js)

// showInstructionsButton.addEventListener('click', openInstructions);
// closeInstructionsButton.addEventListener('click', closeInstructions);
// instructionsModal.addEventListener('click', (e) => {
//     if (e.target === instructionsModal) {
//         closeInstructions();
//     }
// });

const updateScoreDisplay = () => {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    comboDisplay.textContent = combo;
    bpmDisplay.textContent = currentBPM;
};

/**
 * Displays a transient feedback message on screen.
 */
const showFeedback = (text, colorClass, duration = 500) => {
    feedbackMessage.textContent = text;
    feedbackMessage.className = `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-extrabold opacity-100 transition-opacity duration-100 ease-in-out ${colorClass}`;

    setTimeout(() => {
        feedbackMessage.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-extrabold opacity-0 transition-opacity duration-300 ease-in-out';
    }, duration);
};

const updateStreakDisplay = () => {
    // Removed - combo is now shown in the header
};

// (Movido da Seção 4.5 pois é uma função de UI)
const updatePlayersListUI = () => {
    const players = Object.entries(playersData);
    playersCountDisplay.textContent = players.length;

    // Sort by score
    players.sort((a, b) => b[1].score - a[1].score);

    playersList.innerHTML = players.map(([id, player], index) => {
        const isYou = id === currentPlayerId;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const aliveStatus = player.isAlive ? '✅' : '💀';

        return `
            <div class="flex justify-between items-center p-3 bg-gray-${isYou ? '600' : '700'} rounded ${isYou ? 'border-2 border-yellow-400' : ''}">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${medal || aliveStatus}</span>
                    <span class="font-bold ${isYou ? 'text-yellow-300' : 'text-white'}">${player.name}${isYou ? ' (VOCÊ)' : ''}</span>
                </div>
                <div class="flex gap-6 items-center text-sm">
                    <span class="text-yellow-400">⭐ ${player.score}</span>
                    <span class="text-red-400">❤️ ${player.lives}</span>
                    <span class="text-purple-400">🔥 ${player.combo}x</span>
                </div>
            </div>
        `;
    }).join('');
};