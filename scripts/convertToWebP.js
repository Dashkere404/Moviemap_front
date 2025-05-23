// Используем CommonJS синтаксис, несмотря на то, что проект использует ESM
// Этот файл будет запускаться отдельно от основного приложения
const fs = require('fs');
const path = require('path');
// Для установки sharp: npm install sharp --save-dev
const sharp = require('sharp');

// Директории с изображениями
const ASSETS_DIR = path.join(__dirname, '../src/assets');
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/webp');

// Создаем директорию для WebP, если она не существует
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Функция для конвертации изображения в WebP
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 80 }) // Качество 80% - хороший баланс между размером и качеством
      .toFile(outputPath);
    
    console.log(`Успешно конвертировано: ${path.basename(outputPath)}`);
    
    // Получаем размеры файлов для сравнения
    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
    
    console.log(`Экономия: ${savings}% (${(originalSize / 1024).toFixed(2)}KB → ${(webpSize / 1024).toFixed(2)}KB)`);
  } catch (error) {
    console.error(`Ошибка при конвертации ${inputPath}:`, error);
  }
}

// Функция для обработки всех изображений в директории
async function processDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const inputPath = path.join(directory, file);
      
      // Пропускаем директории и неподдерживаемые форматы
      if (fs.statSync(inputPath).isDirectory()) continue;
      
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) continue;
      
      const outputPath = path.join(OUTPUT_DIR, `${path.basename(file, ext)}.webp`);
      await convertToWebP(inputPath, outputPath);
    }
  } catch (error) {
    console.error(`Ошибка при обработке директории ${directory}:`, error);
  }
}

// Запускаем обработку
(async () => {
  console.log('Начинаем конвертацию изображений в WebP...');
  
  await processDirectory(ASSETS_DIR);
  await processDirectory(PUBLIC_DIR);
  
  console.log('Конвертация завершена!');
})(); 