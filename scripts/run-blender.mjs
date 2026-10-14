import { execFile } from 'node:child_process';

const args = process.argv.slice(2);
const blenderPath = process.env.BLENDER_PATH || 'blender';

console.log(`Executing Headless Blender with 15s timeout...`);

const child = execFile(blenderPath, ['-b', ...args], { timeout: 15000 }, (error, stdout, stderr) => {
  if (error) {
    if (error.killed) {
      console.error('❌ Error: Blender execution exceeded 15 seconds and was terminated to prevent CLI deadlock.');
    } else {
      console.error(`❌ Blender Process Error: ${error.message}`);
    }
    process.exit(1);
  }
  console.log(stdout);
  console.log('✓ Blender task completed successfully.');
});