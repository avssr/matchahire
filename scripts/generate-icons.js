const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [16, 32, 180, 192, 512];
const publicDir = path.join(process.cwd(), 'public');

// Create a simple icon with the letter M
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#10B981';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

// Generate icons
sizes.forEach(size => {
  const icon = generateIcon(size);
  const filename = size === 16 ? 'favicon-16x16.png' :
                  size === 32 ? 'favicon-32x32.png' :
                  size === 180 ? 'apple-touch-icon.png' :
                  size === 192 ? 'android-chrome-192x192.png' :
                  'android-chrome-512x512.png';
  
  fs.writeFileSync(path.join(publicDir, filename), icon);
});

// Generate favicon.ico (16x16)
const favicon = generateIcon(16);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon); 