const express = require('express')
const connection = require('./database/connection')

const port = 8080;
const app = express();
const db = connection.connection

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static('static'));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.get('/', (req, res) => {
    const substance = 'Acarbosum';
    const sql = `
    SELECT lek.nazwa
        FROM Lek lek
        LEFT JOIN Substancja sub
        ON sub.nazwa = ?
        LIMIT 10
    `;

    db.query(sql, substance, (err, result) => {
        if (err) {
            console.error('Query failed.');
            throw err;
        }

        names = ''
        result.forEach(record => {
            names += record['nazwa'] + ' ';
        });

        res.render('example.pug', {medicine: names});
    });
});