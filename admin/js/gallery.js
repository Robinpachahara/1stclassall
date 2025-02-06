

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwzCdgwPBzrurEkmNarLD_U32xrdm_pfEtT5pZH4TBVVg29RQetmGjhun3KSWgHWTA/exec';

// Toast notification system
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
${message}
<button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
`;
    toastContainer.appendChild(toast);

    // Trigger reflow for animation
    toast.offsetHeight;
    toast.classList.add('show');

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modern confirmation dialog
let confirmResolve = null;

function showConfirmDialog(message) {
    return new Promise(resolve => {
        confirmResolve = resolve;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmDialog').style.display = 'flex';
    });
}

function closeConfirmDialog(result) {
    document.getElementById('confirmDialog').style.display = 'none';
    if (confirmResolve) {
        confirmResolve(result);
        confirmResolve = null;
    }
}
async function deleteProductGroup(itemName, card) {
    const message = `Are you sure you want to delete "${itemName}" and all its related images?`;
    document.getElementById('confirmMessage').textContent = message;

    const confirmed = await showConfirmDialog(message);

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?action=deleteProductGroup&itemName=${encodeURIComponent(itemName)}`);
        const result = await response.json();

        if (result.success) {
            card.remove();
            showToast('Product group deleted successfully');
        } else {
            showToast('Failed to delete product group: ' + result.message, 'error');
        }
    } catch (error) {
        showToast('Error deleting product group: ' + error.message, 'error');
    }
}

// Update the showConfirmDialog function
function showConfirmDialog(message) {
    return new Promise(resolve => {
        confirmResolve = resolve;
        const dialog = document.getElementById('confirmDialog');
        document.getElementById('confirmMessage').textContent = message;
        dialog.style.display = 'flex';
    });
}

function loadProducts() {
    return fetch(`${SCRIPT_URL}?action=getProducts`)
        .then(response => response.json())
        .catch(error => {
            showToast('Failed to load products: ' + error.message, 'error');
            throw error;
        });
}

// Rest of your existing functions remain the same
function groupProductsByDescription(products) {
    const grouped = {};
    products.forEach(product => {
        const key = product.itemName;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(product);
    });
    return Object.values(grouped);
}

function createProductCard(productGroup) {
    const product = productGroup[0];
    const isInStock = product.inStock.toLowerCase() === 'yes';

    const imageSlides = productGroup.map((p, index) =>
        `<img src="${p.fileUrl}" class="product-image" style="display: ${index === 0 ? 'block' : 'none'};">`
    ).join('');

    const slideControls = productGroup.length > 1 ? `
<button class="prev" onclick="changeSlide(this, -1)">❮</button>
<button class="next" onclick="changeSlide(this, 1)">❯</button>` : '';

    const card = document.createElement('div');
    card.className = `product-card ${isInStock ? '' : 'out-of-stock'}`;

    // Create the HTML content
    card.innerHTML = `
${!isInStock ? '<div class="out-of-stock-banner">Out of Stock</div>' : ''}
<div class="slideshow-container">
    ${imageSlides}
    ${slideControls}
</div>
<h3 class="product-name">${product.itemName}</h3>
<p class="product-description">${product.description}</p>
<p class="product-price">Price: <del>${product.price}</del></p>
<p class="product-discount">Discounted Price: <strong>${product.discountedPrice}</strong></p>
<p class="product-rating">Rating: <span class="rating">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</span></p>
<p><span class="stock-status ${isInStock ? 'in-stock' : 'no-stock'}">
    ${isInStock ? 'In Stock' : 'Out of Stock'}
</span></p>
<div class="button-container">
    <button onclick="openModal(0, ${JSON.stringify(productGroup).replace(/"/g, '&quot;')})">View Full Image</button>
    <button class="delete-btn" onclick="deleteProductGroup('${product.itemName.replace(/'/g, "\\'")}', this.closest('.product-card'))">Delete All</button>
</div>
`;
    return card;
}

function displayProducts(products) {
    document.getElementById('loading').style.display = 'none';
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    groupProductsByDescription(products).forEach(group => {
        gallery.appendChild(createProductCard(group));
    });
}

function changeSlide(button, direction) {
    const container = button.parentElement;
    const images = container.querySelectorAll('.product-image');
    let currentIndex = Array.from(images).findIndex(img => img.style.display === 'block');

    images[currentIndex].style.display = 'none';
    let nextIndex = (currentIndex + direction + images.length) % images.length;
    images[nextIndex].style.display = 'block';
}

let modalImages = [];
let currentModalIndex = 0;

function openModal(index, images) {
    modalImages = images;
    currentModalIndex = index;
    document.getElementById('modalImage').src = modalImages[currentModalIndex].fileUrl;
    document.getElementById('imageModal').style.display = "flex";
}

function changeModalSlide(direction) {
    currentModalIndex = (currentModalIndex + direction + modalImages.length) % modalImages.length;
    document.getElementById('modalImage').src = modalImages[currentModalIndex].fileUrl;
}

function closeModal() {
    document.getElementById('imageModal').style.display = "none";
}

window.onload = () => loadProducts().then(displayProducts);

