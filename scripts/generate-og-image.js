const sharp = require('sharp');
const path = require('path');

async function generateOGImage() {
  const publicPath = path.join(__dirname, '../public');

  try {
    // Create OG image with PowerCA branding
    const width = 1200;
    const height = 630;

    // Create a gradient background
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1D91EB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#155dfc;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#gradient)" />

        <!-- Title -->
        <text x="${width/2}" y="${height/2 - 60}" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
          PowerCA
        </text>

        <!-- Subtitle -->
        <text x="${width/2}" y="${height/2 + 20}" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle">
          Practice Management Software for Chartered Accountants
        </text>

        <!-- Tagline -->
        <text x="${width/2}" y="${height/2 + 80}" font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.9" text-anchor="middle">
          Simplify your practice, amplify your growth
        </text>

        <!-- Website -->
        <text x="${width/2}" y="${height - 50}" font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.8" text-anchor="middle">
          powerca.in
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(path.join(publicPath, 'og-image.jpg'));

    console.log('✅ Created og-image.jpg (1200x630)');

    // Also create a PNG version
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(publicPath, 'og-image.png'));

    console.log('✅ Created og-image.png (1200x630)');

  } catch (error) {
    console.error('Error generating OG image:', error);
    process.exit(1);
  }
}

generateOGImage();