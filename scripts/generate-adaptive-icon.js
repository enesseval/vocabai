const sharp = require('sharp');
const path = require('path');

const ADAPTIVE_SIZE = 1024;
const SAFE_ZONE_PERCENTAGE = 0.66; // Android adaptive icon safe zone

async function generateAdaptiveIcon() {
  try {
    console.log('Generating adaptive icon...');

    const sourcePath = path.join(__dirname, '../src/assets/logo.png');
    const outputPath = path.join(__dirname, '../assets/adaptive-icon.png');

    // Calculate the size for safe zone (66% of 1024 = 675)
    const safeZoneSize = Math.round(ADAPTIVE_SIZE * SAFE_ZONE_PERCENTAGE);

    // Read the logo and resize to fit in safe zone
    const resizedLogo = await sharp(sourcePath)
      .resize(safeZoneSize, safeZoneSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Create adaptive icon with transparent background and centered logo
    await sharp({
      create: {
        width: ADAPTIVE_SIZE,
        height: ADAPTIVE_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: resizedLogo,
      gravity: 'center'
    }])
    .png()
    .toFile(outputPath);

    console.log('✓ Adaptive icon created successfully:', outputPath);
  } catch (error) {
    console.error('Error generating adaptive icon:', error);
    process.exit(1);
  }
}

generateAdaptiveIcon();
