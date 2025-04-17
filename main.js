const clientId = window.env.SPOTIFY_CLIENT_ID;

const redirectUri = window.location.hostname === "127.0.0.1"
  ? window.env.SPOTIFY_REDIRECT_URI_LOCAL
  : window.env.SPOTIFY_REDIRECT_URI_NETLIFY;

console.log(clientId);       // should print your client ID
console.log(redirectUri);    // should print your local redirect URI on Live Server
const scopes = "user-read-private user-read-email user-top-read";
let termLength = "short_term";

// Generate PKCE code verifier
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

// Generate PKCE code challenge
async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}


//login with PKCE
async function login() {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("code_verifier", codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Call Netlify function to get the auth URL
    const response = await fetch("/.netlify/functions/spotify-auth", {
        method: "POST",
        body: JSON.stringify({ code_challenge: codeChallenge })
    });

    if (!response.ok) {
        console.error("Failed to get auth URL from serverless function");
        return;
    }

    const { authUrl } = await response.json();
    window.location = authUrl;
}



// Create and display track list
async function updateList(userData) {
    let dict = {};
    console.log(userData);
    console.log(termLength);

    $('.list-group').empty();

    for (let i = 0; i < userData.length; i++) {
        const artistNames = userData[i].artists.map(artist => artist.name).join(", ");
        $('.list-group').append(`
            <a href="https://open.spotify.com/track/${userData[i].id}" 
               target="_blank" 
               class="list-group-item list-group-item-action mb-1 border-0">
                <p class="mb-1 fw-bold">${userData[i].name}</p>
                <small class="song-artists">${artistNames}</small>
            </a>
        `);
        dict[`${userData[i].name}`] = artistNames;
    }

    console.log(dict);
}



// GET user's top ten tracks
async function getTopTracks(accessToken) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${termLength}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("User's data:", data.items);
        document.getElementById("status-result").textContent = `Fetched top ${data.items.length} tracks!`;
        updateList(data.items);
        return data.items;
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        document.getElementById("status-result").textContent = "Failed to fetch top tracks.";
        return null;
    }
}



// Handle Spotify callback
async function handleSpotifyFlow() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
        try {
            const codeVerifier = localStorage.getItem("code_verifier");
            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body:
                    `grant_type=authorization_code&` +
                    `code=${code}&` +
                    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                    `client_id=${clientId}&` +
                    `code_verifier=${codeVerifier}`,
            });

            if (!tokenResponse.ok) {
                throw new Error(`Token request failed! Status: ${tokenResponse.status} ${await tokenResponse.text()}`);
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            localStorage.setItem("spotify_access_token", accessToken);
            localStorage.removeItem("code_verifier");

            window.history.replaceState({}, document.title, window.location.pathname);

            console.log("Successfully connected to Spotify");

            const tracks = await getTopTracks(accessToken);
            if (!tracks) {
                localStorage.removeItem("spotify_access_token");
                await login();
            }
        } catch (error) {
            console.error("Error in Spotify flow:", error);
            document.getElementById("status-result").textContent = "Error connecting to Spotify.";
            localStorage.removeItem("code_verifier");
            await login();
        }
        return;
    }

    const storedToken = localStorage.getItem("spotify_access_token");
    if (storedToken) {
        console.log("Using stored access token");
        const tracks = await getTopTracks(storedToken);
        if (tracks) {
            document.getElementById("status-result").textContent = `Fetched top ${tracks.length} tracks!`;
        } else {
            console.log("Stored token invalid, clearing and re-login");
            localStorage.removeItem("spotify_access_token");
            await login();
        }
    } else {
        await login();
    }
}

// Run
if (clientId && redirectUri && !clientId.includes('${process.env') && !redirectUri.includes('${process.env')) {
    handleSpotifyFlow();
} else {
    console.error("Client ID or Redirect URI not defined");
    document.getElementById("status-result").textContent = "Error: Configuration missing.";
}