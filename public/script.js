async function buildChart() {
    const selectedIds = [];
    if(window.lineChart) window.lineChart.destroy();
    for (const checkbox of document.getElementsByTagName('input')) {
        if (checkbox.checked) {
            selectedIds.push(checkbox.getAttribute('data-id'));
        }
    }

    const response = await fetch(`http://localhost:${8080}/prices`, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify(selectedIds)
    });

    // Represent data as tuples (drug, date, price)
    const records = await response.json();
    const drugs = [];
    const prices = [];
    const datasets = [];
    
    for (let i = 0; i < selectedIds.length; i++) {
        prices.push(new Array());
    }

    var maxDate = 0;
    var minDate = 9999;

    for (const record of records) {
        if(drugs[record[0]] === undefined) drugs[record[0]] = {data: []};
        drugs[record[0]].data.push({date: record[1], price: record[2]});

        const splitDate = record[1].split("/");
        const intDate = parseInt(splitDate[0]) + parseInt(splitDate[1]) * 100;
        if (minDate > intDate) minDate = intDate;
        if (maxDate < intDate) maxDate = intDate;
    }

    var maxYear = parseInt(maxDate/100);
    var maxMonth = maxDate%100;
    var minYear = parseInt(minDate/100);
    var minMonth = minDate%100;

    var range = 0;
    range += maxYear-minYear;
    range *= 12;
    range += maxMonth-minMonth+2;
    
    let drugCounter = 0;

    for (const [key, drug] of Object.entries(drugs)) {
        let data = new Array(parseInt(range/2));
        data.fill(null);
        
        for (const entry of drug.data) {
            const splitDate = entry.date.split("/");
            let index = 0;
            index += parseInt(splitDate[1]);
            index -= minYear;
            index *= 12;
            index += parseInt(splitDate[0]);
            index -= minMonth;
            data[parseInt(index/2)] = entry.price;
        }
        
        const color = Math.random()*360;
        const set = {
            label: key,
            fill: false,
            data: data, 
            borderColor: 'hsl('+color+',100%,40%)',
            //backgroundColor: ''
        }
        datasets.push(set);
    }    
    const labels = new Array(parseInt(range/2));
    labels.fill("DUPA");
    labels[0]="paweł";
    labels[labels.length-1]="benis";
    const ctx = document.getElementById('myChart').getContext('2d');
    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title:{
                display: true,
                text:'Chart.js Line Chart - Multi Axis'
            }
        }
    });



}