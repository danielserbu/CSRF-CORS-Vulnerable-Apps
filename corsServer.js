const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

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

app.get('/corsIndex.html', (req, res) => {
	res.sendFile(__dirname + '/corsIndex.html');
  });

app.post('/vulnerable', (req, res) => {
  const data = req.body.data;
  res.json({ message: `Received data: ${data}` });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
