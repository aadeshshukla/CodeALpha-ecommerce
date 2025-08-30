// Enhanced cart management functions with authentication

// Get cart data (authenticated)
async function getCart() {
    if (!isAuthenticated()) {
        return { items: [], total: 0 };
    }

    try {
        const response = await makeAuthenticatedRequest('/api/cart');
        
        if (response && response.ok) {
            const data = await response.json();
            return data.success ? data.data.cart : { items: [], total: 0 };
        }
        return { items: [], total: 0 };
    } catch (error) {
        console.error('Error getting cart:', error);
        return { items: [], total: 0 };
    }
}

// Add item to cart (authenticated)
async function addToCart(productId, quantity = 1) {
    if (!isAuthenticated()) {
        showNotification('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }

    try {
        const response = await makeAuthenticatedRequest('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                updateCartCount();
                showNotification('Item added to cart!', 'success');
                return data.data.cart;
            } else {
                showNotification(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
    return null;
}

// Update item quantity in cart
async function updateCartItemQuantity(productId, quantity) {
    if (!isAuthenticated()) return;

    try {
        const response = await makeAuthenticatedRequest('/api/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                loadCartPage();
                updateCartCount();
                showNotification('Cart updated', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart', 'error');
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    if (!isAuthenticated()) return;

    try {
        const response = await makeAuthenticatedRequest(`/api/cart/remove/${productId}`, {
            method: 'DELETE'
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                loadCartPage();
                updateCartCount();
                showNotification('Item removed from cart', 'success');
            }
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item', 'error');
    }
}

// Clear entire cart
async function clearCart() {
    if (!isAuthenticated()) return;

    if (!confirm('Are you sure you want to clear your cart?')) {
        return;
    }

    try {
        const response = await makeAuthenticatedRequest('/api/cart/clear', {
            method: 'DELETE'
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                loadCartPage();
                updateCartCount();
                showNotification('Cart cleared', 'success');
            }
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('Error clearing cart', 'error');
    }
}

// Load cart page
async function loadCartPage() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const cart = await getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (!cartItemsContainer || !cartSummaryContainer) return;
    
    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <a href="/" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        cartSummaryContainer.innerHTML = '';
        return;
    }
    
    // Display cart items
    cartItemsContainer.innerHTML = `
        <h2>Cart Items (${cart.items.length})</h2>
        <div class="cart-items-list">
            ${cart.items.map(item => `
                <div class="cart-item" data-product-id="${item.product._id}">
                    <img src="${item.product.images[0]?.url || 'https://via.placeholder.com/100'}" 
                         alt="${item.product.name}" 
                         onerror="this.src='https://via.placeholder.com/100'">
                    <div class="cart-item-info">
                        <h4>${item.product.name}</h4>
                        <p class="cart-item-description">${item.product.description.substring(0, 100)}...</p>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                        <div class="stock-info ${item.product.stock < item.quantity ? 'low-stock' : ''}">
                            ${item.product.stock < item.quantity 
                                ? `Only ${item.product.stock} left in stock` 
                                : `${item.product.stock} in stock`}
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="updateCartItemQuantity('${item.product._id}', ${item.quantity - 1})" 
                                ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button onclick="updateCartItemQuantity('${item.product._id}', ${item.quantity + 1})"
                                ${item.quantity >= item.product.stock ? 'disabled' : ''}>+</button>
                    </div>
                    <div class="cart-item-total">
                        <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="remove-btn" onclick="removeFromCart('${item.product._id}')">
                            Remove
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Calculate totals
    const subtotal = cart.total;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;
    
    // Display cart summary
    cartSummaryContainer.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-details">
            <div class="summary-line">
                <span>Subtotal (${cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Tax (8%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            ${shipping === 0 ? '<div class="free-shipping-note">🎉 You qualify for free shipping!</div>' : 
              `<div class="shipping-note">Add $${(100 - subtotal).toFixed(2)} more for free shipping</div>`}
            <div class="summary-line total-line">
                <span><strong>Total</strong></span>
                <span><strong>$${total.toFixed(2)}</strong></span>
            </div>
        </div>
        <button class="checkout-btn" onclick="proceedToCheckout()">
            Proceed to Checkout
        </button>
        <button class="btn btn-outline clear-cart-btn" onclick="clearCart()">
            Clear Cart
        </button>
        <div class="continue-shopping">
            <a href="/" class="btn btn-secondary">Continue Shopping</a>
        </div>
    `;
}

// Proceed to checkout
function proceedToCheckout() {
    if (!isAuthenticated()) {
        showNotification('Please login to checkout', 'warning');
        window.location.href = '/login';
        return;
    }
    
    window.location.href = '/checkout';
}

// Update cart count in navigation
async function updateCartCount() {
    if (!isAuthenticated()) {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = '0';
        }
        return;
    }

    try {
        const cart = await getCart();
        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Enhanced checkout page functionality
async function loadCheckoutPage() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const cart = await getCart();
    const orderSummaryContainer = document.getElementById('order-summary');
    
    if (!orderSummaryContainer) return;
    
    if (cart.items.length === 0) {
        orderSummaryContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some items before checkout.</p>
                <a href="/" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    // Calculate totals
    const subtotal = cart.total;
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    orderSummaryContainer.innerHTML = `
        <h2>Order Summary</h2>
        <div class="checkout-items">
            ${cart.items.map(item => `
                <div class="checkout-item">
                    <img src="${item.product.images[0]?.url || 'https://via.placeholder.com/60'}" 
                         alt="${item.product.name}">
                    <div class="item-details">
                        <h4>${item.product.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="checkout-totals">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Tax:</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
                <span><strong>Total:</strong></span>
                <span><strong>$${total.toFixed(2)}</strong></span>
            </div>
        </div>
    `;
}

// Process order
async function processOrder() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const shippingAddress = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        street: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country') || 'US'
    };

    const orderBtn = document.querySelector('.checkout-btn');
    const originalText = orderBtn.textContent;
    
    try {
        // Show loading state
        orderBtn.textContent = 'Processing Order...';
        orderBtn.disabled = true;
        
        const response = await makeAuthenticatedRequest('/api/orders', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            showNotification('Order placed successfully!', 'success');
            
            // Show order confirmation
            setTimeout(() => {
                alert(`Order placed successfully!\nOrder Number: ${data.data.order.orderNumber}\nTotal: $${data.data.order.total.toFixed(2)}`);
                window.location.href = '/profile#order-history';
            }, 1000);
        } else {
            showNotification(data.message || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
    } finally {
        // Reset button
        orderBtn.textContent = originalText;
        orderBtn.disabled = false;
    }
}

// Helper functions (if not already imported)
if (typeof makeAuthenticatedRequest === 'undefined') {
    async function makeAuthenticatedRequest(url, options = {}) {
        const token = localStorage.getItem('token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(url, mergedOptions);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return null;
        }

        return response;
    }
}