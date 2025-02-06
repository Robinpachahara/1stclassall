function loadSubscribers() {
    fetch('https://script.google.com/macros/s/AKfycbxQhPYn9zbjypnp4zNdPytf8tBexh1OriWSKY_uoEzbzkfHOUhFKAbqq1NorBFLXiEE/exec')
        .then(response => response.json())
        .then(data => {
            if (!data?.data) return;
            const tableBody = document.getElementById('subscriber-data');
            tableBody.innerHTML = data.data.map(row => `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.email}</td>
                    <td><span class="status">${row.subscribe}</span></td>
                </tr>
            `).join('');
        })
        .catch(error => console.error("Error:", error));
}
loadSubscribers();