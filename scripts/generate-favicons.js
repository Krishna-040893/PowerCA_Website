const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicons() {
  const logoPath = path.join(__dirname, '../public/images/powerca-logo.png');
  const publicPath = path.join(__dirname, '../public');

  try {
    // Read the logo
    const logo = sharp(logoPath);

    // Generate favicon-16x16.png
    await logo.clone()
      .resize(16, 16)
      .toFile(path.join(publicPath, 'favicon-16x16.png'));
    console.log('✅ Created favicon-16x16.png');

    // Generate favicon-32x32.png
    await logo.clone()
      .resize(32, 32)
      .toFile(path.join(publicPath, 'favicon-32x32.png'));
    console.log('✅ Created favicon-32x32.png');

    // Generate apple-touch-icon.png (180x180)
    await logo.clone()
      .resize(180, 180)
      .toFile(path.join(publicPath, 'apple-touch-icon.png'));
    console.log('✅ Created apple-touch-icon.png');

    // Generate android-chrome-192x192.png
    await logo.clone()
      .resize(192, 192)
      .toFile(path.join(publicPath, 'android-chrome-192x192.png'));
    console.log('✅ Created android-chrome-192x192.png');

    // Generate android-chrome-512x512.png
    await logo.clone()
      .resize(512, 512)
      .toFile(path.join(publicPath, 'android-chrome-512x512.png'));
    console.log('✅ Created android-chrome-512x512.png');

    // Generate favicon.ico (multi-resolution)
    await logo.clone()
      .resize(32, 32)
      .toFile(path.join(publicPath, 'favicon.ico'));
    console.log('✅ Created favicon.ico');

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();