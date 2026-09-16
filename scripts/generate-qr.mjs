import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrl = process.argv[2] || 'https://bubble-shooter-game.vercel.app';
const outputPath = process.argv[3] || path.join(__dirname, '..', 'qr-code.png');

async function generate() {
  try {
    await QRCode.toFile(outputPath, targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    console.log(`Đã tạo mã QR thành công tại: ${outputPath}`);
    console.log(`Đường link mã hóa: ${targetUrl}`);
  } catch (err) {
    console.error('Lỗi khi tạo mã QR:', err);
  }
}

generate();
