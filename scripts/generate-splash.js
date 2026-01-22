const sharp = require('sharp');
const path = require('path');

const SPLASH_WIDTH = 1284;
const SPLASH_HEIGHT = 2778;
const BG_COLOR = '#1e1b4b'; // Dark indigo matching app theme
const LOGO_SIZE = 400; // Logo size on splash screen

async function generateSplash() {
  try {
    console.log('Generating splash screen...');

    const iconPath = path.join(__dirname, '../assets/icon.png');
    const splashPath = path.join(__dirname, '../assets/splash.png');

    // Read and resize the icon
    const resizedIcon = await sharp(iconPath)
      .resize(LOGO_SIZE, LOGO_SIZE, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Create splash screen with centered logo
    await sharp({
      create: {
        width: SPLASH_WIDTH,
        height: SPLASH_HEIGHT,
        channels: 4,
        background: BG_COLOR
      }
    })
    .composite([{
      input: resizedIcon,
      gravity: 'center'
    }])
    .png()
    .toFile(splashPath);

    console.log('✓ Splash screen created successfully:', splashPath);
  } catch (error) {
    console.error('Error generating splash screen:', error);
    process.exit(1);
  }
}

generateSplash();
