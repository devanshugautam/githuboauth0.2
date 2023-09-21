const express = require('express');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();
const server = oauth2orize.createServer();

const clients = [
  { id: '**************', secret: '********************', name: 'Example Client' },
];

const users = [
  { id: 'user123', username: 'devanshugautam', password: '***********' },
];

const tokens = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Client Serialization
server.serializeClient((client, done) => {
  return done(null, client.id);
});

// Client Deserialization
server.deserializeClient((id, done) => {
  const client = clients.find((c) => c.id === id);
  return done(null, client);
});

// Grant authorization code
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
  const code = Math.random().toString(36).substring(7);
  tokens.push({ code, clientId: client.id, userId: user.id });

  return done(null, code);
}));

// Exchange authorization code for an access token
server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
  const token = Math.random().toString(36).substring(7);
  const tokenObj = { token, clientId: client.id };
  tokens.push(tokenObj);

  return done(null, tokenObj);
}));

// Middleware to check for a valid access token
function isAuthenticated(req, res, next) {
    console.log("req.query", req.query)
  const token = req.query.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const tokenObj = tokens.find((t) => t.token === token);

  if (!tokenObj) {
    return res.status(401).json({ error: 'Invalid access token' });
  }

  // You can also check token expiration here

  next();
}

// GET request that requires OAuth 2.0 authentication
app.get('/secure', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a secure GET request.' });
});

// POST request that requires OAuth 2.0 authentication
app.post('/secure', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a secure POST request.' });
});

// OAuth 2.0 authorization endpoint
app.get('/oauth/authorize',
  passport.authenticate(['oauth2-client-password'], { session: false }),
  server.authorization((clientID, redirectUri, done) => {
    const client = clients.find((c) => c.id === clientID);
    if (!client) {
      return done(null, false);
    }

    return done(null, client, redirectUri);
  }),
  (req, res) => {
    res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
  }
);

// OAuth 2.0 decision endpoint
app.post('/oauth/authorize/decision', server.decision());

// OAuth 2.0 token endpoint
app.post('/oauth/token', passport.authenticate(['oauth2-client-password'], { session: false }), server.token(), server.errorHandler());

app.listen(3000, () => {
  console.log('OAuth 2.0 server is running on http://localhost:3000');
});
