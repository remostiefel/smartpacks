import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

// Remove duplicates from devDependencies that are already in dependencies
const buildTools = [
  'vite',
  'esbuild',
  'typescript',
  'tsx',
  '@vitejs/plugin-react',
  'autoprefixer',
  'postcss',
  'tailwindcss',
  '@tailwindcss/vite',
  '@replit/vite-plugin-cartographer',
  '@replit/vite-plugin-dev-banner',
  '@replit/vite-plugin-runtime-error-modal',
  '@tailwindcss/typography'
];

buildTools.forEach(tool => {
  if (pkg.devDependencies && pkg.devDependencies[tool]) {
    delete pkg.devDependencies[tool];
  }
});

writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ Fixed package.json - removed duplicate build tools from devDependencies');
