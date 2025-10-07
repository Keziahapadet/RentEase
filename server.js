const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, 'dist/RentEase/browser')));

// Handle Angular routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/RentEase/browser/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});