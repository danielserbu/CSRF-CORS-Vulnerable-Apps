const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Hardcoded username and password
const username = 'test';
const password = 'test';


const authenticate = (req, res, next) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === username && reqPassword === password) {
    req.session.authenticated = true; // Set authenticated flag in session
    next(); // Proceed to the next middleware or route handler
  } else {
    res.status(401).send('Unauthorized');
  }
};

// CSRF token generation middleware
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path !== '/login') {
    const csrfToken = crypto.randomBytes(16).toString('hex');
    res.cookie('csrfToken', csrfToken);
    res.locals.csrfToken = csrfToken;
    next();
  } else {
    // Skip CSRF token validation for /login and subsequent authenticated routes
    next();
  }
});

// CSRF token validation middleware
const validateCSRFToken = (req, res, next) => {
  const csrfToken = req.cookies.csrfToken;
  if (!csrfToken || csrfToken !== req.body.csrfToken) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//app.use(authenticate);

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

// Route to handle login
app.post('/login', authenticate, (req, res) => {
    res.redirect('/corsIndex.html');
});

// Route to serve a page requiring authentication and CSRF protection
app.get('/corsIndex.html', (req, res) => {
  // Only authenticated users can access this route
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
