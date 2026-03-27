import fs from 'fs';
import path from 'path';

// Regex to match emojis
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F400}-\u{1F4FF}\u{1F200}-\u{1F2FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2B50}\u{23F1}\u{23F3}\u{231A}\u{231B}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FC}\u{25FB}\u{2B1B}\u{2B1C}\u{2B55}\u{2122}\u{00A9}\u{00AE}]/gu;

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic emoji replacements specifically for code usage formatting where text alternative is better
      content = content.replace(/🚀/g, '•');
      content = content.replace(/🚗/g, ''); 
      content = content.replace(/✨/g, '');
      content = content.replace(/🔑/g, '');
      content = content.replace(/👥/g, '');
      content = content.replace(/⛽/g, 'Fuel:');
      content = content.replace(/⚙️/g, 'Gear:');

      // Broad emoji strip just in case
      content = content.replace(emojiRegex, '');

      fs.writeFileSync(fullPath, content);
      console.log('Stripped Emojis from:', file);
    }
  }
}

processDirectory('./src');
console.log('Done stripping emojis!');
