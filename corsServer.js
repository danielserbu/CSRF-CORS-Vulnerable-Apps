const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Hardcoded username and password (replace with proper authentication)
const username = 'test';
const password = 'test';

// CSRF token generation middleware
const generateCSRFToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Middleware to set CSRF token in session and response cookie
const setCSRFToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  res.cookie('XSRF-TOKEN', req.session.csrfToken); // Set CSRF token in a cookie named XSRF-TOKEN
  next();
};

const authenticate = (req, res, next) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === username && reqPassword === password) {
    req.session.authenticated = true;
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

// CSRF token validation middleware
const validateCSRFToken = (req, res, next) => {
  const csrfToken = req.cookies['XSRF-TOKEN']; // Retrieve CSRF token from cookie
  if (!csrfToken || !crypto.timingSafeEqual(Buffer.from(csrfToken), Buffer.from(req.session.csrfToken))) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Adjust for specific origins if needed
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route to serve the login form
app.get('/login', setCSRFToken, (req, res) => {
  // Render the login form
  res.send(`
    <html>
      <body>
        <h2>Login</h2>
        <form action="/login" method="post">
          <input type="text" name="username" placeholder="Username"><br>
          <input type="password" name="password" placeholder="Password"><br>
          <input type="submit" value="Login">
        </form>
      </body>
    </html>
  `);
});

// Route to handle login
app.post('/login', authenticate, (req, res) => {
  res.redirect('/corsIndex.html');
});

// Route to serve a page requiring authentication and CSRF protection
app.get('/corsIndex.html', validateCSRFToken, (req, res) => {
  // Only authenticated users with valid CSRF token can access this route
  if (req.session.authenticated) {
    res.sendFile(__dirname + '/corsIndex.html');
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Route to handle vulnerable POST requests
app.post('/vulnerable', validateCSRFToken, (req, res) => {
  const data = req.body.data;
  if (req.session.authenticated) {
    res.json({ message: `Received data: ${data}` });
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
