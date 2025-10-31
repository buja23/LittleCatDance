 const drawLimb = (startX, startY, angle1, angle2, length) => {
            // Segment 1 (Shoulder to Elbow)
            const elbowX = startX + length * Math.cos(angle1);
            const elbowY = startY + length * Math.sin(angle1);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(elbowX, elbowY);
            ctx.stroke();

            // Segment 2 (Elbow to Hand)
            const handX = elbowX + length * Math.cos(angle1 + angle2);
            const handY = elbowY + length * Math.sin(angle1 + angle2);
            ctx.beginPath();
            ctx.moveTo(elbowX, elbowY);
            ctx.lineTo(handX, handY);
            ctx.stroke();
        };

        /**
         * Draws the entire stick figure
         */
        const drawFigure = (x, color, armAngles, label, labelColor, y = figureY) => {
            const headSize = 20;
            const bodyLength = 80;
            const limbLength = 50;

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';

            // Body and Legs (simplified)
            const bodyEnd = figureY + bodyLength;
            ctx.beginPath();
            ctx.moveTo(x, figureY);
            ctx.lineTo(x, bodyEnd);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, bodyEnd);
            ctx.lineTo(x - 20, bodyEnd + limbLength * 0.7);
            ctx.moveTo(x, bodyEnd);
            ctx.lineTo(x + 20, bodyEnd + limbLength * 0.7);
            ctx.stroke();

            // Head
            ctx.beginPath();
            ctx.arc(x, figureY - headSize / 2, headSize, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.stroke();

            // Arm drawing position
            const shoulderY = figureY + 10;
            const [angleEL1, angleEL2, angleER1, angleER2] = armAngles;

            // Arms
            drawLimb(x, shoulderY, angleEL1, angleEL2, limbLength); // Left Arm
            drawLimb(x, shoulderY, angleER1, angleER2, limbLength); // Right Arm

            // Label
            ctx.font = '20px Inter';
            ctx.fillStyle = labelColor;
            ctx.textAlign = 'center';
            ctx.fillText(label, x, figureY - 90);
        };
