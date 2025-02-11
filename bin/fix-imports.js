import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const esmDir = join(process.cwd(), 'dist/esm/src');
const cjsDir = join(process.cwd(), 'dist/cjs/src');

function fixImports(dir, isEsm = false) {
  console.log(`Beginning run for ${dir}`);
  if (!existsSync(dir)) {
    console.log(`❌ Directory not found: ${dir}`);
    return;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    if (file.endsWith('.js') || file.endsWith('.cjs')) {
      let content = readFileSync(filePath, 'utf8');

      // Fix ESM imports (`import ... from './module'`)
      if (isEsm) {
        content = content.replace(/(from\s+['"]\..*?)(['"])/g, '$1.js$2');
      }
      // Fix CJS imports (`require("./module")`)
      else {
        content = content.replace(/(require\(['"]\..*?)(['"]\))/g, '$1.js$2');
      }

      writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${filePath}`);
    } else if (!file.includes('.')) {
      fixImports(filePath, isEsm);
    }
  });
}

// Fix both ESM and CJS builds
fixImports(esmDir, true);
fixImports(cjsDir, false);
console.log('✅ All imports fixed to include .js extensions');
