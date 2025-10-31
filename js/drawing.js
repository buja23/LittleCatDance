// =========================================================
// SECTION 5: DRAWING LOGIC (Corrigido para Imagens Estáticas)
// =========================================================

const drawFigure = (type, poseKey, animState, x, y, label, labelColor) => {

    const spriteInfo = SPRITE_DATA[type][poseKey];
    if (!spriteInfo) {
        console.warn(`Sprite data não encontrado para ${type} ${poseKey}`);
        return;
    }

    const img = loadedImages[spriteInfo.src];
    if (!img) {
        return; // Imagem ainda não carregou
    }

    const frame = animState.currentFrame;

    // =======================================================
    // LÓGICA DE RECORTE (Horizontal) - AGORA COM CASO ESTÁTICO
    // =======================================================

    let sx, sy, sWidth, sHeight;

    if (spriteInfo.frameCount === 1) {
        // 1. CASO ESTÁTICO (frameCount é 1)
        // Recorta a imagem inteira, ignorando frameWidth/Height
        sx = 0;
        sy = 0;
        sWidth = img.width;   // Largura total da imagem
        sHeight = img.height; // Altura total da imagem
    } else {
        // 2. CASO ANIMADO (frameCount > 1)
        // Recorta o frame correto da tira horizontal
        sx = frame * spriteInfo.frameWidth; // O X muda com o frame
        sy = 0;                             // O Y é sempre 0
        sWidth = spriteInfo.frameWidth;   // O tamanho do recorte (ex: 32)
        sHeight = spriteInfo.frameHeight; // O tamanho do recorte (ex: 32)
    }
    // =======================================================

    // 5. Calcula a posição e o TAMANHO de destino no canvas
    // (O 'SPRITE_SCALE' [Zoom] funciona para ambos os casos)
    const dWidth = sWidth * SPRITE_SCALE;
    const dHeight = sHeight * SPRITE_SCALE;
    const dx = x - dWidth / 2;  // Centraliza a imagem
    const dy = y - dHeight;     // Coloca a base da imagem no 'y'

    // 6. Desenha o frame
    try {
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    } catch (e) {
        console.error("Erro ao desenhar imagem:", e, img, sx, sy, sWidth, sHeight);
    }

    // 7. Desenha o Label
    ctx.font = '20px Inter';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, dy - 10); // 10 pixels acima do sprite
};

