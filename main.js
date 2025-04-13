

const clientId = "d6e3508364bc452bb0175ba0dca1039d";
const clientSecret = "1f51308a7b3c47acaf386cc3f2f8c328";
const artistId = "6fxyWrfmjcbj5d12gXeiNV";              //example artist ID: Denzel Curry



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
}

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
}

// Run the function
getArtistData();