const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Test server is working!');
});

app.listen(4000, () => {
    console.log('Test server running on http://localhost:4000');
});