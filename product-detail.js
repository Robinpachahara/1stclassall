const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1mElcuDW3kZniSQVn1XbdJdPpJodPbM1wOyTw3CDzYNVVONjP0gC9nmu8omsQynvD-w/exec';

let currentSlideIndex = 0;
let productGroup = [];

function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadProductDetail() {
    const productId = getProductIdFromUrl();
    
    return fetch(`${SCRIPT_URL}?action=getProducts`)
        .then(response => response.json())
        .then(products => {
            // Find all products with the same name as the selected product
            const selectedProduct = products.find(p => p.fileId === productId);
            if (!selectedProduct) throw new Error('Product not found');
            
            productGroup = products.filter(p => p.itemName === selectedProduct.itemName);
            displayProductDetail(productGroup);
        })
        .catch(error => {
            console.error('Error loading product:', error);
            document.body.innerHTML = '<h1>Product not found</h1>';
        });
}

function displayProductDetail(productGroup) {
    const product = productGroup[0];
    const isInStock = product.inStock?.toLowerCase() === 'yes';

    // Update product information
    document.getElementById('product-name').textContent = product.itemName;
    document.getElementById('original-price').textContent = product.price;
    document.getElementById('discounted-price').textContent = product.discountedPrice;
    document.getElementById('product-description').textContent = product.description;
    
    // Update rating
    document.getElementById('rating').innerHTML = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    
    // Update stock status
    const stockStatus = document.getElementById('stock-status');
    stockStatus.textContent = isInStock ? 'In Stock' : 'Out of Stock';
    stockStatus.className = isInStock ? 'in-stock' : 'no-stock';

    // Setup add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.disabled = !isInStock;
    addToCartBtn.onclick = () => addToCart(product.fileId);

    // Setup slideshow
    setupSlideshow(productGroup);
}

function setupSlideshow(productGroup) {
    const imagesContainer = document.getElementById('product-images');
    const dotsContainer = document.getElementById('slide-dots');
    
    // Create slides
    imagesContainer.innerHTML = productGroup.map((product, index) => `
        <div class="slide" style="display: ${index === 0 ? 'block' : 'none'}">
            <img src="${product.fileUrl}" alt="${product.itemName}">
        </div>
    `).join('');
    
    // Create dots
    dotsContainer.innerHTML = productGroup.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="showSlide(${index})"></span>
    `).join('');
}

function changeDetailSlide(direction) {
    showSlide(currentSlideIndex + direction);
}

function showSlide(index) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    
    // Handle circular navigation
    currentSlideIndex = (index + slides.length) % slides.length;
    if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
    
    // Hide all slides
    Array.from(slides).forEach(slide => slide.style.display = 'none');
    Array.from(dots).forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    slides[currentSlideIndex].style.display = 'block';
    dots[currentSlideIndex].classList.add('active');
}

function addToCart(productId) {
    const product = productGroup.find(p => p.fileId === productId);
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

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cart = getCart();
    loadProductDetail();
});