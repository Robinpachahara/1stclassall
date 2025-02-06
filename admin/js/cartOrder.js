
function loadSubscribers() {
    fetch('https://script.google.com/macros/s/AKfycbzSmw6LZ0uq4LihCg6nqMnd8ragjMD80zXWHnkPpA42y3EYH-w_R2T3tMGsCbv9UCzq/exec')
        .then(response => response.json())
        .then(data => {
            if (!data?.data) return;
            const tableBody = document.getElementById('subscriber-data');
            tableBody.innerHTML = data.data.map(row => `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.number}</td>
                    <td>${row.items}</td>
                    <td>${row.subtotal}</td>
                    <td>${row.gst}</td>
                    <td>${row.total}</td>
                    
                </tr>
            `).join('');
        })
        .catch(error => console.error("Error:", error));
}
loadSubscribers();
