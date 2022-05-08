require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Connection: Failed to connect MySQL.');
        throw err;
    }
    console.log('Connection: MySQL connected successfully.');
});

module.exports = {connection};


