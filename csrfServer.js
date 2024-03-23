const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/csrfIndex.html', (req, res) => {
	res.sendFile(__dirname + '/csrfIndex.html');
  });

app.post('/transfer', (req, res) => {
  const { amount } = req.body;
  console.log(`Transferring ${amount} to a malicious account!`);
  res.send('Transfer successful');
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Transfer Money</h2>
        <form action="/transfer" method="post">
          Amount: <input type="text" name="amount"><br>
          <input type="submit" value="Transfer">
        </form>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
