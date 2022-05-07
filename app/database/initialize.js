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
        console.error('Failed to create database.');
        throw err;
    }
    console.log('Database created successfully.');
});

db.changeUser({database : 'MIMED'}, (err) => {
    if (err) {
        console.error('Failed to change database.');
        throw err;
    }
    console.log('Database changed successfully.');
})

function tableCallback(name, err) {
    if (err) {
        console.log(`Failed to create table [${name}]`);
        throw err;
    }

    console.log(`Table [${name}] created successfully.`);
};

db.query(
    `CREATE TABLE Substancja (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nazwa TEXT NOT NULL
    )`
, (err) => tableCallback('Substancja', err));

db.query(
    `CREATE TABLE Lek (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        substancja INT NOT NULL ,
        nazwa TEXT NOT NULL,
        zawartosc TEXT NOT NULL,
        FOREIGN KEY (substancja) REFERENCES Substancja(id)
    )`
, (err) => tableCallback('Lek', err));

db.query(
    `CREATE TABLE Cena (
        wartosc INT NOT NULL,
        dzien DATE NOT NULL,
        lek INT NOT NULL,
        PRIMARY KEY(dzien, lek),
        FOREIGN KEY(lek) REFERENCES Lek(id)
    )`
, (err) => tableCallback('Cena', err));


setTimeout(() => {
    console.log('Press Ctrl+C to exit.');
}, timeout);