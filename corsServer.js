const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Sample users for demonstration (Replace with your actual authentication logic)
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' }
];

// Middleware to check authentication
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const username = credentials[0];
  const password = credentials[1];

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  // Attach user object to request for further use
  req.user = user;
  next();
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.method === 'GET') {
    const csrfToken = crypto.randomBytes(16).toString('hex');
    res.cookie('csrfToken', csrfToken);
    res.locals.csrfToken = csrfToken;
    next();
  } else {
    const csrfToken = req.body.csrfToken || req.query.csrfToken;
    const storedCsrfToken = req.cookies.csrfToken;
    if (csrfToken && storedCsrfToken && csrfToken === storedCsrfToken) {
      next();
    } else {
      res.status(403).send('CSRF Token Invalid!');
    }
  }
});

app.get('/corsIndex.html', authenticate, (req, res) => {
  res.sendFile(__dirname + '/corsIndex.html');
});

app.post('/vulnerable', authenticate, (req, res) => {
  const data = req.body.data;
  res.json({ message: `Received data: ${data}` });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
