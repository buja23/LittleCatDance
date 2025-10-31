  const getHighScoreDocRef = () => {
            if (!window.doc) return null;
            const userId = window.userId || 'demo-user';
            const path = `users/${userId}/game_data/little_cat_dance`;
            return window.doc(window.db, path);
        };

        const loadHighScore = () => {
            if (!window.db || !window.onSnapshot) return;

            const docRef = getHighScoreDocRef();
            if (docRef) {
                window.onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        highScore = data.highScore || 0;
                        highScoreDisplay.textContent = highScore;
                    } else {
                        highScore = 0;
                        highScoreDisplay.textContent = 0;
                    }
                }, (error) => {
                    console.error("Error setting up high score listener:", error);
                });
            }
        };

        const saveHighScore = async (newScore) => {
            if (!window.setDoc) return;

            if (newScore > highScore) {
                highScore = newScore;
                highScoreDisplay.textContent = newScore;

                const docRef = getHighScoreDocRef();
                if (docRef) {
                    try {
                        await window.setDoc(docRef, {
                            highScore: newScore,
                            updated: new Date().toISOString()
                        }, { merge: true });
                        showFeedback('🏆 NOVO RECORDE! 🏆', 'text-yellow-400', 2000);
                    } catch (e) {
                        console.error("Error saving high score:", e);
                    }
                }
            }
        };