const { renameSync, existsSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const projectRoot = join(__dirname, '..');
const apiPath = join(projectRoot, 'app', 'api');
// Move outside of the app/ folder so Next.js doesn't scan it
const backupPath = join(projectRoot, 'api-backup');

let apiBackedUp = false;

try {
  // 1. Back up the app/api folder if it exists
  if (existsSync(apiPath)) {
    console.log('📦 Temporarily moving app/api outside of the app/ directory...');
    renameSync(apiPath, backupPath);
    apiBackedUp = true;
  }

  // 2. Execute Next.js build with STATIC_EXPORT env variable set
  console.log('🚀 Running Next.js static build...');
  const result = spawnSync('npx', ['next', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
    },
  });

  if (result.status !== 0) {
    process.exitCode = result.status || 1;
  }
} catch (error) {
  console.error('❌ Static build script failed:', error);
  process.exitCode = 1;
} finally {
  // 3. Always restore the app/api folder
  if (apiBackedUp && existsSync(backupPath)) {
    console.log('🩹 Restoring app/api directory...');
    renameSync(backupPath, apiPath);
  }
}
