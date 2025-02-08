
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1mElcuDW3kZniSQVn1XbdJdPpJodPbM1wOyTw3CDzYNVVONjP0gC9nmu8omsQynvD-w/exec';

function loadProducts() {
    return fetch(`${SCRIPT_URL}?action=getProducts`)
        .then(response => response.json())
        .catch(error => { throw new Error('Failed to load products') });
}

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
    const isInStock = product.inStock?.toLowerCase() === 'yes';

    const imageSlides = productGroup.map((p, index) =>
        `<img src="${p.fileUrl}" class="product-image" style="display: ${index === 0 ? 'block' : 'none'};">`
    ).join('');

    const slideControls = productGroup.length > 1 ? `
        <button class="prev" onclick="event.stopPropagation(); changeSlide(this, -1)">❮</button>
        <button class="next" onclick="event.stopPropagation(); changeSlide(this, 1)">❯</button>
    ` : '';

    return `
        <div class="product-card ${!isInStock ? 'out-of-stock' : ''}" onclick="window.location.href='product-detail.html?id=${product.fileId}'">
            ${!isInStock ? '<div class="out-of-stock-banner">Out of Stock</div>' : ''}
            <div class="slideshow-container">
                ${imageSlides}
                ${slideControls}
            </div>
            <h3 class="product-name">${product.itemName}</h3>
            
            <p class="product-price">Price: <del> ₹${product.price}</del></p>
            <p class="product-discount">Discounted Price: <strong> ₹${product.discountedPrice}</strong></p>
            <p class="product-rating">Rating: <span class="rating">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</span></p>
            <p><span class="stock-status ${isInStock ? 'in-stock' : 'no-stock'}">
                ${isInStock ? 'In Stock' : 'Out of Stock'}
            </span></p>
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product.fileId}')" ${!isInStock ? 'disabled' : ''}>
                Add to Cart
            </button>
            <button class="view-full-image" onclick="event.stopPropagation(); openModal(0, ${JSON.stringify(productGroup).replace(/"/g, '&quot;')})">
                View Full Image
            </button>
        </div>
    `;
}

// At the top of your products.js or within the script tag in products.html
let productsData = [];

function loadProducts() {
    return fetch(SCRIPT_URL + '?action=getProducts')
        .then(response => response.json())
        .then(data => {
            productsData = data; // Store the data globally
            return data;
        })
        .catch(error => { throw new Error('Failed to load products') });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart
    window.cart = getCart();

    // Load products
    loadProducts().then(displayProducts);
});

function addToCart(productId) {
    const product = productsData.find(p => p.fileId === productId);
    if (product && window.cart) {
        const price = parseInt(product.discountedPrice.toString().replace(/\D/g, ''));
        window.cart.addItem({
            id: product.fileId,
            name: product.itemName,
            price: price,
            image: product.fileUrl,
            description: product.description
        });
    }
}

let filteredCategory = "all"; // Default category

function displayProducts(products) {
    document.getElementById("loading").style.display = "none";

    // Filter products based on selected category
    const filteredProducts = products.filter(product =>
        filteredCategory === "all" || product.category === filteredCategory
    );

    document.getElementById("gallery").innerHTML = groupProductsByDescription(filteredProducts)
        .map(createProductCard)
        .join('');
}

function filterProducts(category) {
    filteredCategory = category;

    // Highlight selected category button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="filterProducts('${category}')"]`).classList.add('active');

    // Reload and display products for the selected category
    displayProducts(productsData);
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

window.onload = () => {
    loadProducts().then(displayProducts);
    cart.init(); // Initialize the cart
};

