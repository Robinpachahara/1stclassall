
        


// Fetch stats from Google Apps Script
fetch('https://script.google.com/macros/s/AKfycbx1mElcuDW3kZniSQVn1XbdJdPpJodPbM1wOyTw3CDzYNVVONjP0gC9nmu8omsQynvD-w/exec?action=getProducts')
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalUploads').textContent = data.length;
        document.getElementById('recentUploads').textContent = data.slice(10, ).length;
        
        const activitiesList = document.getElementById('activitiesList');
        data.slice(10, ).forEach(item => {
            activitiesList.innerHTML += `
                <div style="padding: 1rem 0; border-bottom: 1px solid #eee;">
                    ${new Date(item.date).toLocaleDateString()} - ${item.itemName}
                </div>
            `;
        });
    })
    .catch(error => console.error('Error:', error));
