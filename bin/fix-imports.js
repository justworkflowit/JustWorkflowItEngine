import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist/js/src');

function fixImports(dir) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    if (file.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf8');
      content = content.replace(/(from\s+['"]\..*?)(['"])/g, '$1.js$2');
      writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${filePath}`);
    } else if (!file.includes('.')) {
      fixImports(filePath);
    }
  });
}

fixImports(distDir);
console.log('✅ All imports fixed to include .js extensions');
