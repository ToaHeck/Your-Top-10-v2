

const clientId = "d6e3508364bc452bb0175ba0dca1039d";
const clientSecret = "1f51308a7b3c47acaf386cc3f2f8c328";
const artistId = "6fxyWrfmjcbj5d12gXeiNV";              //example artist ID: Denzel Curry
const redirectUri = "http://127.0.0.1:5500/";           // Change this
const scopes = "user-read-private user-read-email user-top-read";


//"short_term" = 4 weeks
//"medium_term" = 6 months
//"long_ter" = several years
let termLength ="long_term";



//generate PKCE code verifier
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}//end generateCodeVerifier()



//generate PKCE code challenge
async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}//end generateCodeChallenge()




//get access token
async function getAccessToken() {
    const authString = btoa(`${clientId}:${clientSecret}`); // Base64 encode clientId:clientSecret
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${authString}`,
            },
        body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            throw new Error(`Token request failed! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error getting access token:", error);
        return null;
    }
}//end getAccessToken()



//login with PKCE
async function login() {
    //generate and store code verifier
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("code_verifier", codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    //build authorization URL
    const authUrl =
        `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

    window.location = authUrl; // Redirect to Spotify login
}//end login()




async function updateList(userData){
    console.log(userData);
    console.log(termLength);

    $('.list-group').empty(); //clear existing items

    //update html list
    for (i = 0; i < userData.length; i++){
        //build curr track's artists string
        const artistNames = userData[i].artists.map(artist => artist.name).join(", ");

        //build new list-item
        $('.list-group').append(`
            <a href="https://open.spotify.com/track/${userData[i].id}" 
            target="_blank" 
            class="list-group-item list-group-item-action">
                <p class="mb-1 fw-bold">${userData[i].name}</p>
                <small class="song-artists">${artistNames} </small>
            </a>
        `)
    }
};



//GET user's top ten tracks using PCKE
async function getTopTracks(accessToken) {
    try {
        //make the request
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${termLength}`,{
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`, //input parameter
            }
        });

        //check if call was successful
        if (!response.ok){
            throw new Error(`API request failed! Status: ${response.status}`);
        }
        
        //parse response and store in "data"
        const data = await response.json();

        console.log("User's data:", data.items); // Handle the user data
        updateList(data.items);
        return data.items;

    }catch (error){
        console.error("Error fetching user's information:", error);
        document.getElementById("status-result").textContent = "Failed to fetch top tracks.";
        return null;
    }
}//end getTopTracks()



//make GET request to Spotify API
async function getArtistData() {
    //use client/secret ids
    const accessToken = await getAccessToken();
    if (!accessToken) {
        console.error("No access token available");
        return;
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Check if call was successful
        if (!response.ok) {
            throw new Error(`API request failed! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Artist Data:", data);
    } catch (error) {
        console.error("Error fetching artist data:", error);
    }
}//end getArtistData()




//handle Spotify callback
async function handleSpotifyFlow() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    //if code exists, process PKCE token exchange
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

            //store token in localStorage
            localStorage.setItem("spotify_access_token", accessToken);
            localStorage.removeItem("code_verifier");

            //clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            //log success
            console.log("Successfully connected to Spotify");
            console.log("Access Token:", accessToken);

            //fetch top tracks
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

    //no code: check stored token
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
}//end handleSpotifyFlow()












//run functions
getArtistData();
handleSpotifyFlow();