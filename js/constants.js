
        const START_BPM = 60;
        const BPM_INCREASE_RATE = 5;
        const SCORE_DIFFICULTY_THRESHOLD = 300;
        const MAX_LIVES = 3;

        const PERFECT_WINDOW = 100; // ±100ms timing accuracy for "EXCELENTE!"
        const GOOD_WINDOW = 250;  // ±250ms timing accuracy for "BOM!"

        const PERFECT_SCORE = 50;
        const GOOD_SCORE = 20;

        // Defines the stick figure arm angles (in radians) for each pose.
        // Format: [ElbowL1, ElbowL2, ElbowR1, ElbowR2]
        const POSE_DEFINITIONS = {
            'UP_ARMS': { arms: [-Math.PI / 4, -Math.PI / 4, Math.PI / 4, Math.PI / 4] },
            'DOWN_ARMS': { arms: [Math.PI / 2.5, Math.PI / 2.5, -Math.PI / 2.5, -Math.PI / 2.5] },
            'SIDE_ARMS': { arms: [-Math.PI / 2, -Math.PI / 2, Math.PI / 2, Math.PI / 2] },
            'CROSSED_ARMS': { arms: [Math.PI / 4, -Math.PI / 4, Math.PI / 4, -Math.PI / 4] },
        };
        const POSE_DEFINITION_KEYS = Object.keys(POSE_DEFINITIONS);

        // Maps input keys to pose definitions
        const POSE_MAPPING = {
            // Both WASD and Arrows
            'ArrowUp': 'UP_ARMS', 'w': 'UP_ARMS',
            'ArrowDown': 'DOWN_ARMS', 's': 'DOWN_ARMS',
            'ArrowLeft': 'SIDE_ARMS', 'a': 'SIDE_ARMS',
            'ArrowRight': 'CROSSED_ARMS', 'd': 'CROSSED_ARMS',
        };
        const ALL_KEYS = Object.keys(POSE_MAPPING);
        const PLAYER_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];

        // Canvas and Figure positioning
        const canvasWidth = 800;
        const maestroX = canvasWidth * 0.30; // Left - Maestro
        const playerX = canvasWidth * 0.70; // Right - Player
        const figureY = 300 * 0.55;