const express = require('express');
const req = require('express/lib/request');
const connection = require('./database/connection');
const bp = require('body-parser');

const port = 8080;
const app = express();
const db = connection.connection

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static('static'));

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.get('/substance', (req, res) => {
    const getSubstances = 'SELECT nazwa, id FROM Substancja';

    db.query(getSubstances, (err, result) => {
        if (err) {
            console.error('Substance query failed.');
            throw err;
        }

        const substances = [];
        result.forEach(element => {
            substances.push([element['nazwa'], element['id']]);
        });
        res.render('combo.pug', {substances: substances});
    });
});

app.post('/medicine' , (request, response) => {
    const substanceId = parseInt(request.body.dropDown);
    const getMedicine = `SELECT lek.nazwa, lek.zawartosc, lek.id
                            FROM Lek lek
                            JOIN Substancja sub
                            ON lek.substancja = sub.id WHERE sub.id = ?`;
    
    db.query(getMedicine, substanceId, (err, result) => {
        if (err) {
            console.error('Medicine query failed.');
            throw err;
        }

        const medicine = [];
        result.forEach(record => {
            medicine.push([`${record['nazwa']} ${record['zawartosc']}`, record['id']]);
        });

        response.render('check.pug', {medicine: medicine});
    });
});

app.post('/prices', (request, response) => {
    const medicineIds = request.body.showGraph;
    const commaIds = medicineIds.map(element => element).join(',');
    const getPrices = `SELECT lek.nazwa, lek.zawartosc, cena.dzien, cena.wartosc 
                        FROM Lek lek JOIN Cena cena ON lek.id = cena.lek
                        WHERE lek.id IN ( ${commaIds} )`;

    db.query(getPrices, (err, result) => {
        if (err) {
            console.error('Prices query failed.');
            throw err;
        }

        const prices = [];
        // record['dzien'].toString().slice(0, 15) - use to parse date format, remove if not needed
        result.forEach(record => {
            prices.push([`${record['nazwa']} ${record['zawartosc']}`, record['dzien'], record['wartosc']]);
        });

        response.render('graph.pug', {prices: prices});
    })

//    TODO: response
});