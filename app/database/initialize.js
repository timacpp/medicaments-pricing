require('dotenv').config();
const mysql = require('mysql');
const timeout = 2000;

/* We cannot use connection.js, it assumes database exists */
const db = mysql.createConnection({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

db.connect((err) => {
    if (err) {
        console.error('Initialization: Failed to connect MySQL.');
        throw err;
    }
    console.log('Initialization: MySQL connected successfully.');
});

db.query('CREATE DATABASE MIMED', (err, result) => {
    if (err) {
        console.error('Failed to create database');
        throw err;
    }
    console.log('Database created successfully');
});

function tableCallback(name, err, result) {
    if (err) {
        throw err;
    }

    console.log(result);
};

setTimeout(() => {
    console.log('Press Ctrl+C to exit.');
}, timeout);