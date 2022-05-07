const express = require('express')
const connection = require('./database/connection')

const port = 8080;
const app = express();
const db = connection.db

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hejka');
});

