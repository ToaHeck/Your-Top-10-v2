# Your Spotify Top 10

A web application that displays your top 10 most-listened-to tracks from Spotify over over the past month.

## Live Demo

🔗 [https://stellular-maamoul-f64cd9.netlify.app/](https://stellular-maamoul-f64cd9.netlify.app/)

## Features

- View your top 10 Spotify tracks
- Uses Spotify's official Web API with PKCE authentication
- Clean, responsive Bootstrap UI
- Secure authentication flow with no backend server required

## Important Notice About Access

Due to [Spotify's updated Extended Access criteria](https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access), this app is currently in **Development Mode** and can only be used by users who have been explicitly added to the app's allowlist.

Spotify no longer grants Extended Access to individual developers - only to organizations. This means I cannot make this app publicly available to all Spotify users.

### Want to Try It Out?

If you'd like a demo of this application, please email me with:
- **Subject:** Spotify Top 10 Demo Request
- **Include:** Your Spotify account email address

I'll add you to the app's user allowlist (maximum 25 users) so you can experience the app yourself.

## Tech Stack

- **Frontend:** HTML, CSS (Bootstrap 5), JavaScript
- **Authentication:** Spotify OAuth 2.0 with PKCE
- **Hosting:** Netlify
- **API:** Spotify Web API

## Local Development

### Prerequisites

- Node.js and npm installed
- A Spotify Developer account
- Spotify Client ID

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Your-Top-10-v2
```

2. Create an `env.js` file in the root directory:
```javascript
// Local environment variables
// DO NOT commit this file to git!
window.env = {
    SPOTIFY_CLIENT_ID: "your_spotify_client_id",
    SPOTIFY_REDIRECT_URI_LOCAL: "http://127.0.0.1:8000",
    SPOTIFY_REDIRECT_URI_NETLIFY: "https://your-netlify-url.netlify.app/"
};
```

3. Configure your Spotify App:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create or open your app
   - Add redirect URIs:
     - `http://127.0.0.1:8000` (for local development)
     - Your Netlify URL (for production)

4. Run the development server:
```bash
npm run dev
```

5. Open your browser at `http://127.0.0.1:8000`

## Deployment to Netlify

### Environment Variables

Set these environment variables in your Netlify dashboard under **Site settings → Environment variables**:

- `SPOTIFY_CLIENT_ID`: Your Spotify app's client ID
- `SPOTIFY_REDIRECT_URI_LOCAL`: `http://127.0.0.1:8000`
- `SPOTIFY_REDIRECT_URI_NETLIFY`: Your Netlify site URL

### Deploy

Connect your GitHub repository to Netlify for automatic deployments on push to main.

## Project Structure

```
Your-Top-10-v2/
├── index.html              # Main HTML file
├── main.js                 # Application logic and Spotify API integration
├── styles.css              # Custom styles
├── env.js                  # Local environment variables (gitignored)
├── package.json            # npm configuration
├── netlify/
│   └── functions/
│       └── spotify-auth.js # Netlify serverless function (optional)
└── README.md
```

## How It Works

1. **Authentication:** Users are redirected to Spotify's authorization page
2. **PKCE Flow:** Implements OAuth 2.0 PKCE for secure authentication without a backend
3. **API Request:** Once authorized, fetches the user's top 10 tracks from Spotify's API
4. **Display:** Shows track names and artists with direct links to Spotify

## Security Notes

- This app uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication
- No client secret is exposed (not needed with PKCE)
- Environment variables are kept secure and never committed to the repository
- Access tokens are stored in browser localStorage (consider token expiration handling for production)

## Known Limitations

- **User Access:** Limited to 25 users due to Spotify's Development Mode restrictions
- **Token Expiration:** Access tokens expire after 1 hour (requires re-authentication)
- **Public Access:** Cannot be made available to all Spotify users without organizational Extended Access

## Future Improvements

- Add time range selection (4 weeks, 6 months, all time)
- Export functionality for track lists
- Share your top 10 on social media
- Refresh token implementation for persistent sessions

## License

MIT

## Contact

For demo requests or questions, please reach out via email.

---

**Note:** This project is for educational and personal use. It is not affiliated with or endorsed by Spotify.