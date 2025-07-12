// Import necessary modules
const fs = require('fs');
const path = require('path');

// --- File Paths ---
// Define absolute paths for the token list and the .env file.
const tokensFilePath = path.join(__dirname, 'prerender-env-schduler.js');
const envFilePath = path.join(__dirname, '../web/apps/boostexpo/.env');

function rotateToken() {
  try {
    // 1. Read the list of available tokens
    const tokensStr = fs.readFileSync(tokensFilePath, 'utf-8');
    const tokens = JSON.parse(tokensStr);

    if (!Array.isArray(tokens) || tokens.length === 0) {
      console.error('Error: Token file is empty or not a valid JSON array.');
      return;
    }

    // 2. Read the current .env file
    let currentToken = '';
    let envContent = '';

    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf-8');
      const match = envContent.match(/^PRERENDER_TOKEN=(.*)$/m);

      if (match) {
        currentToken = match[1];
      }
    }

    // 3. Determine the next token in the cycle
    const currentIndex = tokens.indexOf(currentToken);
    // The modulo operator (%) ensures we loop back to the start of the array
    const nextIndex = (currentIndex + 1) % tokens.length;
    const nextToken = tokens[nextIndex];

    // 4. Update the .env file content
    let newEnvContent;
    // If a token is already set, replace it.
    if (currentToken && envContent.includes('PRERENDER_TOKEN')) {
      newEnvContent = envContent.replace(/^PRERENDER_TOKEN=.*$/m, `PRERENDER_TOKEN=${nextToken}`);
    } else {
      // Otherwise, add the new token to the end of the file.
      const separator = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '';
      newEnvContent = `${envContent}${separator}PRERENDER_TOKEN=${nextToken}\n`;
    }

    // 5. Write the changes back to the .env file
    fs.writeFileSync(envFilePath, newEnvContent);
    console.log(`Successfully updated PRERENDER_TOKEN to: ${nextToken}`);

  } catch (error) {
    console.error('An unexpected error occurred during token rotation:', error);
  }
}

module.exports = rotateToken;