async function f() {
    let elements = document.getElementsByTagName("input");
    let arr = [];
    for (let element of elements) {
        if (element.checked == true) arr.push(element.getAttribute("data-id"));
    }
    const response = await fetch("http://localhost:8080/prices", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(arr)
    });
    let x = await response.json(); //x receives records of all selected drugs
    console.log(x); //debug
    //return x
    let dates = [];
    let drugs = [];
    let values = [];
    
    for (var i = 0; i < arr.length; i++) {
        values.push(new Array());
    }

    console.log(values.length);

    for (let x_member of x) {
        if (!dates.includes(x_member[1])) dates.push(x_member[1]);
        if (!drugs.includes(x_member[0])) drugs.push(x_member[0]);
    }

    let drug_iter = 0;
    for (let drug of drugs) {                                           //Chcę dla każdego leku stworzyć tablicę cen w kolejnych datach. Jeżeli w danej dacie dany lek nie ma ceny, to musi tam być null.
        let dates_iter = 0;                                             //Iterator dat
        for (let x_member of x) {                                       //x to tablica wyników zapytań (dla każdego x_member x_member[0] to nazwa leku, x_member[1] to data, a x_member[2] to cena)
            if (x_member[0] === drug) {                                 //Sprawdzam czy wynik aktualnie rozpatrywanego rekordu dotyczy aktualnie handlowanego leku
                while (x_member[1] != dates[dates_iter]) {              //Jeżeli data w danym rekordzie nie jest równa kolejnej dacie reprezentowanej przez data[data_iter], to przesuwaj data_iter aż będzie taka sama
                    values[drug_iter].push(null);                       //uzupełnij nullami brakujące cenny
                    dates_iter++;
                }
                values[drug_iter].push(x_member[2]);                    //dodaj kolejną cenę do values
                dates_iter++;                                           //przejdź do następnej daty
            }
        }
        drug_iter++;
    }
    console.log(values);                                                //values nie jest odpowiednio wypełniane nullami, z moich obserwacji pętla while z 39 linii nigdy się nie wywołuje, ale nie wiem dlaczego
    const Chart = require("chart.js")
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: values,
            labels: dates
        }
        
    });
}