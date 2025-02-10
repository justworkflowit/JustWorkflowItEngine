const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/workflowDefinition/jsonSchema');
const destDir = path.join(
  __dirname,
  '../dist/js/src/workflowDefinition/jsonSchema'
);

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`Copying JSON schemas from ${srcDir} to ${destDir}...`);
copyDirSync(srcDir, destDir);
console.log('JSON schema files copied successfully.');
