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
    for (let drug of drugs) {
        let dates_iter = 0;
        for (let x_member of x) {
            if (x_member[0] === drug) {
                while (!(dates[dates_iter] === x_member[1])) {
                    dates_iter++;
                    values[drug_iter].push(null);
                }
                values[drug_iter].push(null);
                dates_iter++;
            }
        }
        drug_iter++;
    }

    console.log(values);

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: values,
            labels: dates
        }
        
    });
}