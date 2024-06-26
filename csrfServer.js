const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Use express-session middleware for session management
app.use(session({
  secret: 'secret-key', // Secret key to sign the session ID cookie
  resave: false,
  saveUninitialized: true
}));

// Hardcoded username and password
const username = 'test';
const password = 'test';

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === username && reqPassword === password) {
    req.session.authenticated = true; // Set authenticated flag in session
    next(); // Proceed to the next middleware or route handler
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Route to serve the login form
app.get('/login', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Login</h2>
        <form action="/login" method="post">
          Username: <input type="text" name="username"><br>
          Password: <input type="password" name="password"><br>
          <input type="submit" value="Login">
        </form>
      </body>
    </html>
  `);
});

// Route to handle login form submission
app.post('/login', authenticate, (req, res) => {
  // If authentication succeeds, redirect to the transfer page
  res.redirect('/transfer');
});

// Route to serve the transfer form
app.get('/transfer', (req, res) => {
  // Check if user is authenticated
  if (req.session.authenticated) {
    res.sendFile(__dirname + '/csrfIndex.html');
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Route to handle money transfer
app.post('/transfer', (req, res) => {
  if (req.session.authenticated) {
    const { amount } = req.body;
    console.log(`Transferring ${amount} to a malicious account!`);
    res.send('Transfer successful');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
