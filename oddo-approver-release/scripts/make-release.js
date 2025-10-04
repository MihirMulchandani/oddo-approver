const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating Oddo Approver release package...');

// Create release directory
const releaseDir = 'oddo-approver-release';
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true });
}
fs.mkdirSync(releaseDir);

// Files and directories to include
const includePaths = [
  'app',
  'prisma',
  'lib',
  'scripts',
  'public',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'postcss.config.js',
  'Dockerfile',
  'docker-compose.yml',
  'env.example',
  'README.md',
  'DEMO.md',
  'NEXT_STEPS_FOR_NON_CODER.md',
  '.gitignore'
];

// Copy files
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📋 Copying files...');
includePaths.forEach(item => {
  if (fs.existsSync(item)) {
    copyRecursive(item, path.join(releaseDir, item));
    console.log(`  ✅ ${item}`);
  } else {
    console.log(`  ⚠️  ${item} not found, skipping`);
  }
});

// Create .env from example
if (fs.existsSync('env.example')) {
  fs.copyFileSync('env.example', path.join(releaseDir, '.env'));
  console.log('  ✅ .env (from example)');
}

// Create zip file
console.log('🗜️  Creating zip file...');
try {
  execSync(`cd ${releaseDir} && zip -r ../oddo-approver-release.zip .`, { stdio: 'inherit' });
  console.log('✅ Release package created: oddo-approver-release.zip');
} catch (error) {
  console.log('⚠️  Could not create zip file. Please manually zip the oddo-approver-release directory.');
}

// Clean up
fs.rmSync(releaseDir, { recursive: true });

console.log('🎉 Release package ready!');
console.log('');
console.log('Files included:');
includePaths.forEach(item => {
  console.log(`  - ${item}`);
});
console.log('');
console.log('To deploy:');
console.log('1. Extract the zip file');
console.log('2. Run: npm install');
console.log('3. Update .env with your configuration');
console.log('4. Run: npm run db:push && npm run db:seed');
console.log('5. Run: npm run dev');
console.log('');
console.log('Or with Docker:');
console.log('1. Extract the zip file');
console.log('2. Run: docker-compose up');
