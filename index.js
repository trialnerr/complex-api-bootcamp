// const { YT_API_KEY } = require("./key.js");
import {
  YT_API_KEY,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_ACCESS_TOKEN,
} from './key.js';
import { codeVerifier, codeChallenge } from './codeVerifier.js';

// const clientId = 'YOUR_CLIENT_ID';
const redirectUri = 'https://trialnerr.github.io/playByWeather/';
// const redirectUri = 'http://127.0.0.1:5500'; 
const scope = 'user-read-private user-read-email';
const authUrl = new URL('https://accounts.spotify.com/authorize');

const form = document.querySelector('form');
form.addEventListener('submit', apiCall);

//getYTData
async function getYTData(artist) {
  console.log({ artist });
  //using urlSearchParams makes the contents of the url-safe, takes care of spaces and such
  const urlParams = new URLSearchParams({
    maxResults: 3,
    q: artist,
    key: YT_API_KEY,
    type: 'video',
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${urlParams.toString()}`;
  console.log({ url });
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `Error in getYTData response ${response.status}, status: ${response.statusText}`
      );
    }

    const data = await response.json();
    const list = document.querySelector('.videoList');
    data.items.forEach((vid) => {
      console.log({ vid });
      const vidListItem = document.createElement('li');
      const vidLink = document.createElement('a');
      vidLink.href = `https://youtube.com/watch?v=${vid.id.videoId}`;
      const img = document.createElement('img');
      img.src = `https://img.youtube.com/vi/${vid.id.videoId}/maxresdefault.jpg`;
      vidLink.appendChild(img);
      vidListItem.append(vidLink);
      list.append(vidListItem);
    });
    console.log({ 'data-in-YT': data });
  } catch (error) {
    console.error(error);
  }
}

//a function that searches for the artists for that year
async function getSpotifyData() {
  const year = 2024;
  const urlParams = new URLSearchParams({
    q: `year:${year}`,
    type: 'artist',
    limit: 1,
    market: 'US',
  });
  const url = `https://api.spotify.com/v1/search?${urlParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
      },
    });
    if (!response.ok) {
      console.error(
        `Error in getSpotifyData response ${response.status}, status: ${response.statusText}`
      );
    }
    const data = await response.json();
    const artist = data.artists.items[0].name;
    return artist;
  } catch (error) {
    console.error(`Error fetching spotify data ${error}`);
  }
}

async function getSpotifyAccessToken() {
  const url = 'https://accounts.spotify.com/api/token';
  const urlParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlParams.toString(),
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

async function getUserData() {
  window.localStorage.setItem('code_verifier', codeVerifier);
  const params = {
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };
  console.log('before', authUrl.toString()); 
  authUrl.search = new URLSearchParams(params).toString();
  console.log('after', authUrl.toString()); 
  window.location.href = authUrl.toString();
}

getUserData();

async function apiCall(e) {
  e.preventDefault();

  const countrySelector = document.querySelector('#country-select');
  const country = countrySelector.options[countrySelector.selectedIndex].value;
  console.log(country);
  const year = document.querySelector('#year').value;

  try {
    const artist = await getSpotifyData();
    // getYTData(artist);
  } catch (error) {
    console.error(error);
  }
}

// getYTData();
// apiCall();
// getSpotifyData();
// getSpotifyAccessToken();

// curl -X POST "https://accounts.spotify.com/api/token" \
//      -H "Content-Type: application/x-www-form-urlencoded" \
//      -d "grant_type=client_credentials&client_id=your-client-id&client_secret=your-client-secret"

//todo
//where to store the accessToken?
//what do you want your UI to look like?
