async function buildChart() {
    const selectedIds = [];

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

    const dates = [];
    const drugs = [];
    const prices = [];
    
    for (let i = 0; i < selectedIds.length; i++) {
        prices.push(new Array());
    }

    for (const record of records) {
        if (!dates.includes(record[1])) {
            dates.push(record[1]);
        }

        if (!drugs.includes(record[0])) {
            drugs.push(record[0]);
        }
    }

    let drug_idx = 0;
    for (const drug of drugs) {
        let date_idx = 0;
        for (const record of records) {
            if (record[0] === drug) {
                while (record[1] != dates[date_idx]) {
                    prices[drug_idx].push(null);
                    date_idx++;
                }
                prices[drug_idx].push(record[2]);
                date_idx++;
            }
        }
        drug_idx++;
    }

    console.log(prices);
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
         type: 'line',
         data: {
             datasets: prices,
             labels: dates
         }
     });
}