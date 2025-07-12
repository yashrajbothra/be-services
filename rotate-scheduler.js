const cron = require('node-cron');
const { exec } = require('child_process');
const rotateToken = require('./rotate-token');

// --- Configuration ---
// IMPORTANT: Replace 'prerender' with your actual pm2 service name if it's different.
const PM2_SERVICE_NAME = 'prerender';

// Schedule the task to run at midnight every Sunday.
// The cron expression '0 0 * * 0' means:
// - 0: at minute 0
// - 0: at hour 0 (midnight)
// - *: every day of the month
// - *: every month
// - 0: on Sunday (0 and 7 both represent Sunday)
cron.schedule('0 0 * * 0', () => {
  console.log('Running cron job: Rotating prerender token...');
  
  // 1. Rotate the token
  rotateToken();

  // 2. Restart the pm2 service
  console.log(`Attempting to restart pm2 service: ${PM2_SERVICE_NAME}...`);
  exec(`pm2 restart ${PM2_SERVICE_NAME}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error restarting PM2 service '${PM2_SERVICE_NAME}':`, err);
      return;
    }
    console.log(`Successfully executed restart command for pm2 service: '${PM2_SERVICE_NAME}'.`);
    if (stdout) {
      console.log('PM2 stdout:', stdout);
    }
    if (stderr) {
      console.error('PM2 stderr:', stderr);
    }
  });
});

console.log('Scheduler started. Waiting for the next scheduled run.');
