async function f() {
    let elements = document.getElementsByTagName("input");
    let arr = [];
    for (let element of elements) {
        if (element.checked == true) arr.push(element.getAttribute("data-id"));
    }
    console.log(arr);
    const response = await fetch("http://localhost:8080/prices", {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'same-origin', // include, *same-origin, omit
        body: JSON.stringify(arr) // body data type must match "Content-Type" header
    });
    let x = await response.json();
    console.log(x);
    let dates = [];
    let values = [];
    for (let x_member of x) {

    }
    return x;

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