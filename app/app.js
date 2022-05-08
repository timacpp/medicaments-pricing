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

//app.use(express.bodyParser());


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// app.get('/', (req, res) => {
//     const substance = 'Acarbosum';
//     const sql = `
//     SELECT lek.nazwa
//         FROM Lek lek
//         LEFT JOIN Substancja sub
//         ON sub.nazwa = ?
//         LIMIT 10
//     `;

//     db.query(sql, substance, (err, result) => {
//         if (err) {
//             console.error('Query failed.');
//             throw err;
//         }

//         names = ''
//         result.forEach(record => {
//             names += record['nazwa'] + ' ';
//         });

//         res.render('example.pug', {medicine: names});
//     });
// });

app.get('/', (req, res) => {
    const getSubstances = 'SELECT nazwa, id FROM Substancja';
    db.query(getSubstances, (err, result) => {
        if (err) {
            console.error('Now you fucked up.');
            throw err;
        }

        // names = ''
        // result.forEach(record => {
        //     names += record['nazwa'] + ' ';
        // });
        const newArr = [];
        result.forEach(element => {
            newArr.push([element['nazwa'], element['id']]);
        });  
        res.render('combo.pug', {Substancja: newArr});
    });

});


app.post("/checkMedicine" , (request, response) => {
    console.log(request.body);
    response.render('check.pug',{
        skill: request.body.dropDown
    });
});
// app.get('/', (req, res) => {
//     const getSubstances = 'SELECT nazwa FROM Substancja';

//     db.query(getSubstances, (err, result) => {
//         if (err) {
//             console.error('Query failed.');
//             throw err;
//         }


//         res.render('example.pug', {medicine: result});
//     });
// });