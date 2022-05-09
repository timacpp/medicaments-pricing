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
    console.log(request.body.dropDown);

    const substanceId = parseInt(request.body.dropDown);
    console.log(typeof substanceId);
    const getMedicines = `SELECT lek.nazwa, lek.zawartosc, lek.id
            FROM Lek lek
            JOIN Substancja sub
            ON lek.substancja = sub.id WHERE sub.id = ?`;

    // response.render('check.pug',{
    //     skill: request.body.dropDown
    // });
    db.query(getMedicines, substanceId, (err, result) => {
        if (err) {
            console.error('Now you fucked up with substance id.');
            throw err;
        }

        var newArr = []
        result.forEach(record => {
            newArr.push([record['nazwa'] + ' ' + record['zawartosc'],
                        record['id']]);
        });
        console.log(newArr);
        response.render('check.pug', {Leki: newArr});
    });
});

app.post("/showGraph", (request, response) => {
    console.log(request.body);
    console.log("arr" + Array.from(request.body));
    const idMedicine = request.body.showGraph;
    // Array.from(request.body).forEach(element => {
    //     idMedicine.push(element[''])
    // });
    console.log(idMedicine);

    let lor_in_list = idMedicine.map(function (a) { return a; }).join(",");
    let sql_query = `SELECT lek.nazwa, lek.zawartosc, cena.dzien, cena.wartosc 
                    FROM Lek lek JOIN Cena cena ON lek.id = cena.lek
                    WHERE lek.id IN ( `+ lor_in_list + `)`;
    console.log('query: ' + sql_query);

    db.query(sql_query, (err, result) => {
        if (err) {
            console.error('Now you fucked up with checkbox id.');
            throw err;
        }

        console.log(result);
        var newArr = []
        //record['dzien'].toString().slice(0, 15)
        result.forEach(record => {
            newArr.push([record['nazwa'] + record['zawartosc'],
                        record['dzien'],
                        record['wartosc']]);
        });
        console.log(newArr);
        response.render('graph.pug', {leki: newArr});
    })
//    response
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