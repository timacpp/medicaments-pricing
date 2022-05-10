async function f() {
    let elements = document.getElementsByTagName("input");
    let arr = [];
    for (let element of elements) {
        if (element.checked == true) arr.push(element.getAttribute("data-id"));
    }
    console.log(arr);
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
    console.log(x);                 //debug
    return x
    let dates = [];             
    let values = [];
    for (let x_member of x) {

    }

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}