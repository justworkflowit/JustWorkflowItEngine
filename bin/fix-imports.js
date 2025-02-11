import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
} from 'fs';
import { join, extname } from 'path';

const esmDir = join(process.cwd(), 'dist/esm/src');
const cjsDir = join(process.cwd(), 'dist/cjs/src');

function fixImports(dir, isEsm = false) {
  console.log(`Processing: ${dir}`);
  if (!existsSync(dir)) {
    console.log(`❌ Directory not found: ${dir}`);
    return;
  }

  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);

    // If it's a directory, recurse
    if (statSync(filePath).isDirectory()) {
      fixImports(filePath, isEsm);
      return;
    }

    // Process only .js or .cjs files
    const ext = extname(file);
    if (ext === '.js' || ext === '.cjs') {
      let content = readFileSync(filePath, 'utf8');

      // Handle ESM imports (`import ... from './module'`)
      if (isEsm) {
        content = content.replace(
          /(from\s+['"])(\.\/[^'"]+?)(['"])/g,
          (match, prefix, importPath, suffix) => {
            const fullPath = join(dir, importPath);
            if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
              return `${prefix}${importPath}/index.js${suffix}`;
            }
            return `${prefix}${importPath}.js${suffix}`;
          }
        );
      }
      // Handle CJS imports (`require("./module")`)
      else {
        content = content.replace(
          /(require\(['"])(\.\/[^'"]+?)(['"]\))/g,
          (match, prefix, importPath, suffix) => {
            const fullPath = join(dir, importPath);
            if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
              return `${prefix}${importPath}/index.js${suffix}`;
            }
            return `${prefix}${importPath}.js${suffix}`;
          }
        );
      }

      writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${filePath}`);
    }
  });
}

// Fix both ESM and CJS builds
fixImports(esmDir, true);
fixImports(cjsDir, false);
console.log(
  '✅ All imports fixed to include .js extensions or /index.js when necessary'
);
