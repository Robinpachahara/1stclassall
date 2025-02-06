// At the top of your cart.js file
window.submitCartToSheet = function() {
  cart.submitToSheet();
};


class NotificationSystem {
  constructor() {
      // Only create container if DOM is ready
      if (document.readyState === 'complete') {
          this.createContainer();
      } else {
          document.addEventListener('DOMContentLoaded', () => this.createContainer());
      }
  }


  createContainer() {
      // Check if container already exists
      if (!document.getElementById('notification-container')) {
          const container = document.createElement('div');
          container.id = 'notification-container';
          container.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 9999;
          `;
          document.body.appendChild(container);
      }
  }

  show(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.style.cssText = `
          background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          margin-bottom: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateX(120%);
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          font-family: 'Poppins', sans-serif;
      `;

      // Add icon based on type
      const icon = document.createElement('i');
      icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
      icon.style.marginRight = '12px';
      notification.appendChild(icon);

      // Add message
      const messageText = document.createElement('span');
      messageText.textContent = message;
      notification.appendChild(messageText);

      // Add to container
      const container = document.getElementById('notification-container');
      container.appendChild(notification);

      // Trigger animation
      setTimeout(() => {
          notification.style.transform = 'translateX(0)';
      }, 100);

      // Remove after delay
      setTimeout(() => {
          notification.style.transform = 'translateX(120%)';
          setTimeout(() => {
              notification.remove();
          }, 300);
      }, 3000);
  }
}



// Initialize notification system
const notifications = new NotificationSystem();

class Cart {
  constructor() {
      this.items = JSON.parse(localStorage.getItem('cart')) || [];
      this.init();
  }

  init() {
      this.updateCartDisplay();
      this.updateCartCount();
      this.calculateTotals();
  }

  addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id && item.name === product.name);
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          this.items.push({ ...product, quantity: 1 });
      }
      this.saveCart();
      this.init();
  }

  removeItem(identifier) {
      this.items = this.items.filter(item => item.id !== identifier && item.name !== identifier);
      this.saveCart();
      this.init();
  }

  updateQuantity(identifier, newQuantity) {
      const item = this.items.find(item => item.id === identifier || item.name === identifier);
      if (item && newQuantity >= 1) {
          item.quantity = newQuantity;
          this.saveCart();
          this.init();
      }
  }

  saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartCount() {
      const cartCountElements = document.getElementsByClassName('cart-count');
      const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
      Array.from(cartCountElements).forEach(element => {
          element.textContent = totalItems;
      });
  }

  formatPrice(price) {
      return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      }).format(price);
  }

  calculateTotals() {
      const subtotalElement = document.getElementById('subtotal');
      const taxElement = document.getElementById('tax');
      const grandTotalElement = document.getElementById('grand-total');

      if (!subtotalElement || !taxElement || !grandTotalElement) return;

      const subtotal = this.items.reduce((total, item) => {
          const price = typeof item.price === 'string' ? 
              parseFloat(item.price.replace(/[^\d.]/g, '')) : 
              item.price;
          return total + (price * item.quantity);
      }, 0);

      const tax = subtotal * 0.18;
      const grandTotal = subtotal + tax;

      subtotalElement.textContent = this.formatPrice(subtotal);
      taxElement.textContent = this.formatPrice(tax);
      grandTotalElement.textContent = this.formatPrice(grandTotal);

      return { subtotal, tax, grandTotal };
  }

  updateCartDisplay() {
      const cartItemsContainer = document.getElementById('cart-items');
      if (!cartItemsContainer) return;

      if (this.items.length === 0) {
          cartItemsContainer.innerHTML = `
              <div class="empty-cart">
                  <i class="fas fa-shopping-cart"></i>
                  <p>Your cart is empty</p>
                  <a href="products.html" class="contact-btn">Continue Shopping</a>
              </div>
          `;
          return;
      }

      cartItemsContainer.innerHTML = this.items.map(item => {
          const price = typeof item.price === 'string' ? 
              parseFloat(item.price.replace(/[^\d.]/g, '')) : 
              item.price;
          const identifier = item.id || item.name;
          
          return `
              <div class="cart-item" data-id="${identifier}">
                  <img src="${item.image}" alt="${item.name}">
                  <div class="item-details">
                      <h3>${item.name}</h3>
                      <p>${item.description || ''}</p>
                  </div>
                  <div class="item-quantity">
                      <button class="quantity-btn minus" onclick="cart.updateQuantity('${identifier}', ${item.quantity - 1})">
                          <i class="fas fa-minus"></i>
                      </button>
                      <span>${item.quantity}</span>
                      <button class="quantity-btn plus" onclick="cart.updateQuantity('${identifier}', ${item.quantity + 1})">
                          <i class="fas fa-plus"></i>
                      </button>
                  </div>
                  <div class="item-price">${this.formatPrice(price * item.quantity)}</div>
                  <button class="remove-item" onclick="cart.removeItem('${identifier}')">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          `;
      }).join('');
  }

  async submitToSheet() {
      const phoneNumber = document.getElementById('contactPhoneNumber')?.value;
      
      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
          notifications.show('Please enter a valid 10-digit phone number', 'error');
          return;
      }

      const totals = this.calculateTotals();
      
      const data = {
          phoneNumber,
          items: this.items.map(item => `${item.name} (${item.quantity}x)`).join(', '),
          itemsDetail: this.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price * item.quantity
          })),
          subtotal: totals.subtotal,
          gst: totals.tax,
          grandTotal: totals.grandTotal,
          timestamp: new Date().toISOString()
      };

      try {
          const response = await fetch('https://script.google.com/macros/s/AKfycby6tgQZR-jlHJLYmBI0fQUxodQZAnRK9aFBfx5FjDaNtGbPTeYHDwp5gPnFv5qdpzHb/exec', {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
          });

          notifications.show('Your order has been submitted successfully. We will contact you shortly.');
          document.getElementById('dropdownForm').style.display = 'none';
          
          // Optional: Clear cart after successful submission
          // this.items = [];
          // this.saveCart();
          // this.init();

      } catch (error) {
          console.error('Error submitting order:', error);
          notifications.show('There was an error submitting your order. Please try again or contact us directly.', 'error');
      }
  }

}

const cart = new Cart();

window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
      cart.init();
  }
});