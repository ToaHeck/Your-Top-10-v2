

const clientId = "d6e3508364bc452bb0175ba0dca1039d";
const clientSecret = "1f51308a7b3c47acaf386cc3f2f8c328";
const artistId = "6fxyWrfmjcbj5d12gXeiNV";              //example artist ID: Denzel Curry
const redirectUri = "http://127.0.0.1:5500/";           // Change this
const scopes = "user-read-private user-read-email";



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



//login on body load
function login(){

    //check if user is already logged in
    if (localStorage.getItem(spotify_login_initiated, true)){
        console.log("Login already initiated, skipping...");
        return; 
    }

    //update login value
    localStorage.setItem("spotify_login_initiated", "true");


    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}`;
      window.location = authUrl;    // Redirect to Spotify login
}//end login()






//make GET request to Spotify API
async function getArtistData() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error("No access token available");
    return;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Artist Data:", data); // Handle the artist data
  } catch (error) {
    console.error("Error fetching artist data:", error);
  }
}//end getArtistData()



// Run the function
getArtistData();