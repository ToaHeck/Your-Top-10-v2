// netlify/functions/spotify-auth.js

export async function handler(event, context) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI_NETLIFY;
  
    const { code_challenge } = JSON.parse(event.body || '{}');
  
    if (!code_challenge) {
      return {
        statusCode: 400,
        body: "Missing code_challenge",
      };
    }
  
    const scopes = "user-read-private user-read-email user-top-read";
  
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `code_challenge=${code_challenge}&` +
      `code_challenge_method=S256`;
  
    return {
      statusCode: 200,
      body: JSON.stringify({ authUrl }),
    };
  }
  