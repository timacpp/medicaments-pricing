function getCheckboxes() {
   return document.getElementsByTagName('input'); 
}

function resetZoomChart() {
    if (window.lineChart == null || has_been_drawn == false) {
        display_error("Wybierz co najmniej jeden lek i zaznacz ,,Kreśl\", by wyświetlić wykres")
    }
    else {
        clear_error();
        window.lineChart.resetZoom();
    }
}

var has_been_drawn = false;

function getPDF() {
    if (window.lineChart == null || has_been_drawn == false) {
        display_error("Wybierz co najmniej jeden lek i zaznacz ,,Kreśl\", by wyświetlić wykres i móc pobrać dane")
    }
    else {
        clear_error();

        const chartCanvas = document.getElementById('myChart');
        const chartCanvasImg = chartCanvas.toDataURL('image/jpeg', 1.0);
        let chartPDF = new jsPDF('landscape');
        chartPDF.setFontSize(20);
        chartPDF.addImage(chartCanvasImg, 'JPEG', 15, 15, 280, 150);
        chartPDF.save('cenylekow.pdf');
    }
}

const bgColor = {
    id: 'bgColor',
    beforeDraw: (chart) => {
        const {ctx, width, height} = chart;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}

function display_error(mess) {
    document.getElementById("invalid").innerHTML=mess;     
    var not_checked = document.querySelectorAll('input.checkbox-input[type=checkbox]')
    not_checked.forEach((element) => {element.style.outline = "2px solid red";})
    document.getElementById("btn-build-chart").style.border="2px solid red";
    document.getElementById("btn-build-chart").style.color="red";
    document.getElementById("btn-build-chart").style.background="yellow";
    if (window.lineChart) window.lineChart.destroy();
}

function clear_error() {
    document.getElementById("invalid").innerHTML="";
    var not_checked = document.querySelectorAll('input.checkbox-input[type=checkbox]')
    not_checked.forEach((element) => {element.style.outline = "";})

    document.getElementById("btn-build-chart").style.border="";
    document.getElementById("btn-build-chart").style.color="";
    document.getElementById("btn-build-chart").style.background="";
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
        display_error("Wybierz co najmniej jeden lek, by wyświetlić wykres");
        has_been_drawn = false;
        return;
    }
    else {
        clear_error();
        has_been_drawn = true;
    }

    const response = await fetch(`http://localhost:8000/prices`, {
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
        plugins: [bgColor],
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        textAlign: 'left',
                        font: {
                            size: 9
                        }
                    }
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        drag: {
                            enabled: true,
                            modifierKey: 'ctrl'
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
