const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve everything inside /public as static files
app.use(express.static(path.join(__dirname, 'public')));

// Default route -> send index.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function () {
    console.log('Server running at http://localhost:' + PORT);
});
