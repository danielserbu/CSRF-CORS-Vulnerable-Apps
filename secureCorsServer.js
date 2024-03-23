const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const allowedOrigins = ['http://example1.com', 'http://example2.com']; // Specify your allowed origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());

app.get('/corsIndex.html', (req, res) => {
	res.sendFile(__dirname + '/corsIndex.html');
  });

app.post('/data', (req, res) => {
  const receivedData = req.body;
  console.log('Received data:', receivedData);
  res.json({ message: 'Data received successfully' });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Non-Vulnerable CORS Application</h2>
        <p>This application only allows requests from specified origins.</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
