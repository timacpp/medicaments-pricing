require('dotenv').config();
const mysql = require('mysql');

console.log(__dirname);
console.log(process.env.DB_SERVER);

const db = mysql.createConnection({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Connection: Failed to connect MySQL.');
        throw err;
    }
    console.log('Connection: MySQL connected successfully.');
});

module.exports = db


