require('dotenv').config();
const mysql = require('mysql');
const csvtojson = require('csvtojson');

const initTimeout = 1000;

const tables = [
    {
        name: 'Substancja',
        file: 'data/csv/substancja.csv',
        rows: 2,
        sql: `
        CREATE TABLE Substancja (
            id INT NOT NULL PRIMARY KEY,
            nazwa TEXT NOT NULL
        )`
    },
    {
        name: 'Lek',
        file: 'data/csv/lek.csv',
        rows: 4,
        sql: `
        CREATE TABLE Lek (
            id INT NOT NULL PRIMARY KEY,
            substancja INT NOT NULL ,
            nazwa TEXT NOT NULL,
            zawartosc TEXT NOT NULL,
            FOREIGN KEY (substancja) REFERENCES Substancja(id)
        )`
    },
    {
        name: 'Cena',
        file: 'data/csv/cena.csv',
        rows: 3,
        sql: `
        CREATE TABLE Cena (
            lek INT NOT NULL,
            wartosc INT NOT NULL,
            dzien DATE NOT NULL,
            PRIMARY KEY(dzien, lek),
            FOREIGN KEY(lek) REFERENCES Lek(id)
        )`
    }
]

/* We cannot use connection.js, it assumes database exists */
const connection = mysql.createConnection({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) {
        console.error('Initialization: Failed to connect MySQL.');
        throw err;
    }
    console.log('Initialization: MySQL connected successfully.');
});

connection.query('CREATE DATABASE MIMED', (err, result) => {
    if (err) {
        console.error('Failed to create database.');
        throw err;
    }
    console.log('Database created successfully.');
});

connection.changeUser({database : 'MIMED'}, (err) => {
    if (err) {
        console.error('Failed to change database.');
        throw err;
    }
    console.log('Database changed successfully.');
})

tables.forEach(table => {
    connection.query(table.sql, (err) => {
        if (err) {
            console.log(`Failed to create table ${table.name}`);
            throw err;
        }
    
        console.log(`Table ${table.name} created successfully.`);
    })
})

let fillPromise = new Promise((resolve) => {
    tables.forEach(table => {
        console.log(`Initializing table ${table.name}`);
        csvtojson().fromFile(table.file).then(source => {
            source.forEach(record => {
                const items = Object.values(record);
                const params = '?, '.repeat(table.rows - 1) + '?'

                const sql = `INSERT INTO ${table.name} values(${params})`;
                connection.query(sql, items, (err) => {
                    if (err) {
                        console.log(`Failed to insert (${items}) into ${table.name}`);
                        throw err;
                    }
                });
            });
        });
    });

    console.log('All tables are initialized successfully');
});

fillPromise.then(() => {
    setTimeout(() => {
        console.log('Press Ctrl+C to exit.');
    }, initTimeout);
});