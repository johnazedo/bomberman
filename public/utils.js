// Function to load an image
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image load error'));
        image.src = url;
    });
}

// Function to load multiple images
async function loadImages(blocks) {
    let images = []
    images[blocks.FIXED_BLOCK] = await loadImage('./assets/ExplodableBlock.png')
    images[blocks.BLOCK] = await loadImage('./assets/SolidBlock.png')
    images[blocks.PLAYER] = await loadImage('./assets/Bman_F_f01.png')
    images[blocks.BOMB] = await loadImage('./assets/Bomb_f01.png')
    images[blocks.FIRE] = await loadImage('./assets/Flame_F04.png')
    images[blocks.FRUIT] = await loadImage('./assets/BombPowerup.png')
    images[blocks.OPPONENT] = await loadImage('./assets/Creep_F_f01.png')
    images[blocks.FRUIT_2] = await loadImage('./assets/FlamePowerup.png')
    return images
}