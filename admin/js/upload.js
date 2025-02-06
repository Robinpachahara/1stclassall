


const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzp4r5-nGQvBUqO8Y2HVes6fdSWbHwcfMXq_fdi-W14tgiP9j1vonb1ZBZmBIZVK3bxgA/exec';

document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    uploadFiles();
});

function uploadFiles() {
    const fileInput = document.getElementById('files');
    const files = fileInput.files;

    // Collect form data
    const itemName = document.getElementById('itemName').value;
    const category = document.getElementById('category').value;
    const rating = document.getElementById('rating').value;
    const price = document.getElementById('price').value;
    const discountedPrice = document.getElementById('discountedPrice').value;
    const inStock = document.getElementById('inStock').value;
    const description = document.getElementById('description').value;

    // Validate inputs
    if (files.length === 0) {
        showStatus('Please select at least one image', false);
        return;
    }

    let uploadPromises = [];

    for (let file of files) {
        let reader = new FileReader();

        let promise = new Promise((resolve, reject) => {
            reader.onload = function (e) {
                let base64Data = e.target.result;

                // Prepare form data
                let formData = new FormData();
                formData.append('base64Data', base64Data);
                formData.append('fileName', file.name);
                formData.append('itemName', itemName);
                formData.append('category', category);
                formData.append('rating', rating);
                formData.append('price', price);
                formData.append('discountedPrice', discountedPrice);
                formData.append('inStock', inStock);
                formData.append('description', description);

                // Send upload request
                fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            resolve('Upload successful for ' + file.name);
                        } else {
                            reject('Upload failed for ' + file.name);
                        }
                    })
                    .catch(error => reject('Error: ' + error.toString()));
            };

            reader.readAsDataURL(file);
        });

        uploadPromises.push(promise);
    }

    Promise.allSettled(uploadPromises).then(results => {
        let messages = results.map(r => r.status === 'fulfilled' ? r.value : r.reason);
        showStatus(messages.join('\n'), results.every(r => r.status === 'fulfilled'));

        // Reset form
        fileInput.value = '';
        document.getElementById('uploadForm').reset();
    });
}

function showStatus(message, isSuccess) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.className = isSuccess ? 'success' : 'error';
}
