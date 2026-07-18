const fs = require('fs');

const toDelete = [
  'frontend/src/assets/hero.png',
  'frontend/src/assets/react.svg',
  'frontend/src/assets/vite.svg',
  'frontend/src/assets/.gitkeep',
  'frontend/public/favicon.svg',
  'frontend/public/icons.svg',
  'frontend/public/.gitkeep',
];

toDelete.forEach(f => {
  try {
    fs.unlinkSync(f);
    console.log('✅ Deleted:', f);
  } catch (e) {
    console.log('⚠️  Skip:', f, '-', e.message);
  }
});

console.log('\nDone! Only logo.jpg files remain.');
