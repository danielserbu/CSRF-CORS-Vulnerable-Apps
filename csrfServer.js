const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Hardcoded username and password
const username = 'user';
const password = 'password';

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === username && reqPassword === password) {
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
  res.sendFile(__dirname + '/csrfIndex.html');
});

// Route to handle money transfer
app.post('/transfer', authenticate, (req, res) => {
  const { amount } = req.body;
  console.log(`Transferring ${amount} to a malicious account!`);
  res.send('Transfer successful');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
