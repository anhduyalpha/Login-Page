import fs from 'fs';
import path from 'path';

const pngPath = path.join(process.cwd(), 'public', 'avartar.png');
const pngBuffer = fs.readFileSync(pngPath);
const base64Png = pngBuffer.toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <defs>
    <clipPath id="circleClip">
      <circle cx="512" cy="512" r="512" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,${base64Png}" width="1024" height="1024" clip-path="url(#circleClip)" />
</svg>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'avatar.svg'), svgContent);
fs.writeFileSync(path.join(process.cwd(), 'public', 'avartar.svg'), svgContent);

console.log('Successfully created public/avatar.svg and public/avartar.svg!');
