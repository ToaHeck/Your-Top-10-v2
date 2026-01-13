const fs = require('fs');

// Generate env.js from environment variables during Netlify build
const envContent = `window.env = {
  SPOTIFY_CLIENT_ID: "${process.env.SPOTIFY_CLIENT_ID}",
  SPOTIFY_REDIRECT_URI_LOCAL: "${process.env.SPOTIFY_REDIRECT_URI_LOCAL}",
  SPOTIFY_REDIRECT_URI_NETLIFY: "${process.env.SPOTIFY_REDIRECT_URI_NETLIFY}"
};
`;

fs.writeFileSync('env.js', envContent);
console.log('env.js generated successfully');
