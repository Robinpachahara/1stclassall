// Google Apps Script deployment URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1mElcuDW3kZniSQVn1XbdJdPpJodPbM1wOyTw3CDzYNVVONjP0gC9nmu8omsQynvD-w/exec';

// Cache for products data
let productsData = null;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const tabButtons = document.querySelectorAll('.tab-btn');
const productTemplate = document.getElementById('product-template');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mainNav = document.querySelector('.main-nav');
const loadingAnimation = document.getElementById('loading-animation');

// Initialize mobile menu
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mainNav && mainNav.classList.contains('active') && 
        !e.target.closest('.main-nav') && 
        !e.target.closest('.mobile-menu-btn')) {
        mainNav.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Show loading animation
function showLoading() {
    if (loadingAnimation) {
        loadingAnimation.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingAnimation) {
        loadingAnimation.style.opacity = '0';
        setTimeout(() => {
            loadingAnimation.style.display = 'none';
            loadingAnimation.style.opacity = '1';
        }, 300);
    }
}

// Fetch products from Google Apps Script
async function fetchProducts() {
    showLoading();
    try {
        console.log('Fetching products from:', SCRIPT_URL);
        const response = await fetch(SCRIPT_URL);
        console.log('Response received:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Skip the first row as it contains headers
        if (data && data.data && data.data.length > 1) {
            productsData = data.data.slice(1).map(product => {
                // Log each product for debugging
                console.log('Processing product:', product);
                
                // Handle image data
                let imageUrl = 'images/placeholder.jpg'; // default fallback image
                if (typeof product.image === 'string') {
                    // If image is a direct URL or path
                    imageUrl = product.image.startsWith('http') ? product.image : `images/${product.image}`;
                } else if (product.image && product.image.toString() === 'Image') {
                    // For Google Drive images, the URL will be provided by the Apps Script
                    imageUrl = product.image; // The Apps Script now converts image cells to URLs
                    console.log('Google Drive image URL:', imageUrl);
                }
                console.log('Image URL for', product.name, ':', imageUrl);

                // Convert rating from date string to number (1-5)
                let rating = 5; // default rating
                if (product.rating) {
                    if (typeof product.rating === 'string' && product.rating.includes('T')) {
                        // Extract day from date and map it to 1-5 rating
                        const day = new Date(product.rating).getDate();
                        rating = ((day % 5) || 5); // Maps days to 1-5, avoiding 0
                    } else {
                        rating = parseFloat(product.rating) || 5;
                    }
                }
                
                // Convert string values to appropriate types
                const processedProduct = {
                    id: String(product.name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    category: (product.category || '').toLowerCase().trim(),
                    name: product.name || '',
                    image: imageUrl,
                    rating: rating,
                    originalPrice: parseFloat(product.orignalPrice) || 0,
                    discountedPrice: parseFloat(product.discountedPrice) || 0,
                    inStock: Boolean(product.inStock)
                };
                
                console.log('Processed product:', processedProduct);
                return processedProduct;
            });
        }
        throw new Error('Invalid data format received');
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading products</p>
                <small>Please try refreshing the page</small>
            </div>
        `;
    } finally {
        hideLoading();
    }
}

// Function to create a product card
function createProductCard(product) {
    const template = document.getElementById('product-template');
    const card = template.content.cloneNode(true);
    
    // Set product image
    const img = card.querySelector('.product-image img');
    if (product.image && product.image !== 'Image' && product.image !== 'No Image') {
        img.src = product.image;
        img.alt = product.name;
        // Handle image loading errors
        img.onerror = function() {
            this.classList.add('error');
        };
    } else {
        img.classList.add('error');
    }
    
    // Set product details
    card.querySelector('.product-title').textContent = product.name || 'Product Name';
    
    // Set rating stars
    const rating = parseFloat(product.rating) || 0;
    const ratingDiv = card.querySelector('.rating');
    ratingDiv.innerHTML = Array(5).fill().map((_, index) => 
        `<i class="fas fa-star${index < rating ? '' : '-o'}"></i>`
    ).join('');
    
    // Set price
    const price = card.querySelector('.price');
    if (product.originalPrice && product.originalPrice !== product.discountedPrice) {
        price.innerHTML = `
            <span class="original">₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="discounted">₹${product.discountedPrice.toLocaleString('en-IN')}</span>
        `;
    } else {
        price.innerHTML = `<span class="discounted">₹${product.discountedPrice.toLocaleString('en-IN')}</span>`;
    }
    
    // Add to cart button functionality
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (!product.inStock) {
        addToCartBtn.textContent = 'Out of Stock';
        addToCartBtn.disabled = true;
        addToCartBtn.style.background = '#999';
    } else {
        addToCartBtn.addEventListener('click', () => handleAddToCart(product));
    }
    
    return card;
}

// Display products for a specific category
function displayProducts(category) {
    console.log('Displaying products for category:', category);
    console.log('Available products:', productsData);
    
    if (!productsData || !Array.isArray(productsData)) {
        console.error('No valid products data available');
        productsGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading products</p>
                <small>Please try refreshing the page</small>
            </div>
        `;
        return;
    }

    // Clear the grid
    productsGrid.innerHTML = '';

    // Filter products by category
    const filteredProducts = productsData.filter(product => {
        const normalizedCategory = category.toLowerCase().trim();
        const productCategory = product.category.toLowerCase().trim();
        return productCategory === normalizedCategory || 
               (normalizedCategory === 'closets' && productCategory === 'closet');
    });
    
    console.log('Filtered products for category', category, ':', filteredProducts);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>No products found in this category</p>
            </div>
        `;
        return;
    }

    // Display products
    filteredProducts.forEach(product => {
        console.log('Creating product card for:', product.name);
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Handle adding product to cart
function handleAddToCart(product) {
    // Get existing cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create a unique cart item
    const cartItem = {
        id: product.id,
        name: product.name,
        price: product.discountedPrice,
        image: product.image,
        description: product.description || '',
        quantity: 1
    };
    
    // Check if product already exists in cart by name
    const existingItemIndex = cartItems.findIndex(item => item.name === product.name);
    
    if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += 1;
    } else {
        // Add new item if it doesn't exist
        cartItems.push(cartItem);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Initialize the page
async function initializePage() {
    console.log('Initializing page...');
    // Show loading state
    productsGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading products...</p>
        </div>
    `;

    try {
        // Fetch products
        await fetchProducts();
        console.log('Products data loaded:', productsData);

        // Set up tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Display products for selected category
                const category = button.getAttribute('data-category');
                displayProducts(category);
            });
        });

        // Display initial category (Summer Cooler)
        const defaultTab = document.querySelector('[data-category="summer-cooler"]');
        if (defaultTab) {
            defaultTab.classList.add('active');
            displayProducts('summer-cooler');
        } else {
            throw new Error('Default category tab not found');
        }
        
    } catch (error) {
        console.error('Error during initialization:', error);
        productsGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading products</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    initializePage();
});

// Google Apps Script functions
function getStatistics() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ProductData');
    const data = sheet.getDataRange().getValues();
    return {
        total: data.length - 1, // Subtract header
        recent: data.slice(-5).map(row => ({
            date: row[0],
            fileName: row[1]
        }))
    };
}

function doGet(e) {
  // If requesting products data
  if (e.parameter.action === 'getProducts') {
    return handleProductRequest(e);
  }
  // If requesting statistics
  else if (e.parameter.action === 'getStatistics') {
    const statistics = getStatistics();
    return ContentService.createTextOutput(JSON.stringify(statistics)).setMimeType(ContentService.MimeType.JSON);
  }
  // Otherwise return the upload form
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Image Upload System')
      .setFaviconUrl('https://www.google.com/images/favicon.ico');
}

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
    const imageSlides = productGroup.map((p, index) =>
        `<img src="${p.fileUrl}" class="product-image" style="display: ${index === 0 ? 'block' : 'none'};">`
    ).join('');

    const slideControls = productGroup.length > 1 ? `
        <button class="prev" onclick="changeSlide(this, -1)">❮</button>
        <button class="next" onclick="changeSlide(this, 1)">❯</button>` : '';

    return `
        <div class="product-card">
            <div class="slideshow-container">
                ${imageSlides}
                ${slideControls}
            </div>
            <h3 class="product-name">${product.itemName}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">Price: <del>${product.price}</del></p>
            <p class="product-discount">Discounted Price: <strong>${product.discountedPrice}</strong></p>
             <p class="product-rating">Rating: <span class="rating">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</span></p>
            <button class="add-to-cart" onclick="addToCart('${product.fileId}')">Add to Cart</button>
            <button onclick="openModal(0, ${JSON.stringify(productGroup).replace(/"/g, '&quot;')})">View Full Image</button>
        </div>
    `;
}

function addToCart(productId) {
    // Logic to add the product to the cart
    console.log('Product added to cart:', productId);
    // You can implement cart logic here, such as updating a cart array or local storage.
}

function displayProducts(products) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gallery').innerHTML = groupProductsByDescription(products).map(createProductCard).join('');
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

// Add category filter dropdown in the HTML
const categoryFilter = document.createElement('select');
categoryFilter.innerHTML = `<option value='all'>All Categories</option>` +
    productsData.map(product => `<option value='${product.category}'>${product.category}</option>`).join('');
categoryFilter.addEventListener('change', (event) => {
    const selectedCategory = event.target.value;
    const filteredProducts = selectedCategory === 'all' ? productsData : productsData.filter(p => p.category === selectedCategory);
    displayProducts(filteredProducts);
});
document.body.insertBefore(categoryFilter, document.getElementById('gallery'));

// Update createProductCard for better styling
function createProductCard(productGroup) {
    const product = productGroup[0];
    const imageSlides = productGroup.map((p, index) =>
        `<img src="${p.fileUrl}" class="product-image" style="display: ${index === 0 ? 'block' : 'none'};">`
    ).join('');

    const slideControls = productGroup.length > 1 ? `
        <button class="prev" onclick="changeSlide(this, -1)">❮</button>
        <button class="next" onclick="changeSlide(this, 1)">❯</button>` : '';

    return `
        <div class="product-card">
            <div class="slideshow-container">
                ${imageSlides}
                ${slideControls}
            </div>
            <h3 class="product-name">${product.itemName}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">Price: <del>${product.price}</del></p>
            <p class="product-discount">Discounted Price: <strong>${product.discountedPrice}</strong></p>
             <p class="product-rating">Rating: <span class="rating">${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}</span></p>
            <button class="add-to-cart" onclick="addToCart('${product.fileId}')">Add to Cart</button>
            <button onclick="openModal(0, ${JSON.stringify(productGroup).replace(/"/g, '&quot;')})">View Full Image</button>
        </div>
    `;
}
