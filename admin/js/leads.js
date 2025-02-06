
function loadSubscribers() {
    fetch('https://script.google.com/macros/s/AKfycbzhAbQvRVUOE4ZYNcPvzXtcsrAxCiR22xNC7E9UAIX3IOQ0IB09N09rAK5YTwryzJg/exec')
        .then(response => response.json())
        .then(data => {
            if (!data?.data) return;
            const tableBody = document.getElementById('subscriber-data');
            tableBody.innerHTML = data.data.map(row => `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.name}</td>
                    <td>${row.number}</td>
                    <td>${row.cetagory}</td>
                    
                </tr>
            `).join('');
        })
        .catch(error => console.error("Error:", error));
}
loadSubscribers();
