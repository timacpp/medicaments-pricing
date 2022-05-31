function getCheckboxes() {
   return document.getElementsByTagName('input'); 
}

function resetZoomChart() {
    window.lineChart.resetZoom();
}

async function buildChart() {
    const buildChartButton = document.getElementById("btn-build-chart");
    buildChartButton.disabled = true;
    const selectedIds = [];
    for (const checkbox of getCheckboxes()) {
        if (checkbox.checked) {
            selectedIds.push(checkbox.getAttribute('data-id'));
        }
    }

    if (selectedIds.length == 0) {
        buildChartButton.disabled = false;
        return;
    }

    const response = await fetch(`http://localhost:8080/prices`, {
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
        const priceStr = record[2].toString();
        const pricePln = priceStr.substr(0, priceStr.length - 2) + '.' + priceStr.substr(priceStr.length - 2, 2);
        drugs[record[0]].data.push({date: record[1], price: pricePln});

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
        }
        datasets.push(set);
    }

    const labels = new Array(parseInt(range/2));
    labels.fill("");

    let labelYear = parseInt(minDate/100);
    let labelMonth = parseInt(minDate%100);

    for (let labelMember in labels) {
        labels[labelMember] = labelMonth + "/" + labelYear;
        labelMonth+=2;
        if (labelMonth > 12) {
            labelMonth -= 12;
            labelYear++;
        }
    }
    const ctx = document.getElementById('myChart').getContext('2d');
    if(window.lineChart) window.lineChart.destroy();
    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true
                    }
                }
            },
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title:{
                display: true,
                text:'Ceny'
            }
        },
        tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    return tooltipItem.yLabel.toFixed(2);
                }
            }
        }
    });
    buildChartButton.disabled = false;
}


function selectAll() {
    for (const checkbox of getCheckboxes()) {
        checkbox.checked = true;
    }
}

function unselectAll() {
    for (const checkbox of getCheckboxes()) {
        checkbox.checked = false;
    }
}

function reverseSelect() {
    for (const checkbox of getCheckboxes()) {
        checkbox.checked ^= 1;
    }
}
