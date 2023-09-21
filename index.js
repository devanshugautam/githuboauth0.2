const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 3000;

// Replace these with your GitHub OAuth 2.0 credentials
const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';
const redirectUri = 'http://localhost:3000/callback'; // Should match your GitHub OAuth app settings

app.get('/', (req, res) => {
  // Redirect the user to the GitHub OAuth login page
  const authorizeUrl = 'https://github.com/login/oauth/authorize';
  const queryParams = querystring.stringify({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user', // Adjust the scope according to your requirements
  });
  res.redirect(`${authorizeUrl}?${queryParams}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  // Exchange the code for an access token
  const tokenUrl = 'https://github.com/login/oauth/access_token';
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        Accept: 'application/json',
      },
    });

    const accessToken = response.data.access_token;

    // Use the access token to make authenticated requests to GitHub API
    const userData = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Display user data
    res.json(userData.data);
  } catch (error) {
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
