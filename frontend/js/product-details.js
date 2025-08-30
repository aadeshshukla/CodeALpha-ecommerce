// Enhanced product details page functionality

async function loadProductDetails() {
    const productId = window.location.pathname.split('/').pop();
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayProductDetails(data.data.product);
            loadRelatedProducts(data.data.product.category, productId);
        } else {
            throw new Error('Product not found');
        }
        
        // Initialize navigation and cart count
        initializeNavigation();
        updateCartCount();
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('product-details').innerHTML = `
            <div class="error-message">
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="/" class="btn btn-primary">Back to Products</a>
            </div>
        `;
    }
}

function displayProductDetails(product) {
    const container = document.getElementById('product-details');
    
    container.innerHTML = `
        <div class="product-image-gallery">
            <div class="main-image">
                <img src="${product.images[0]?.url || 'https://via.placeholder.com/600x400'}" 
                     alt="${product.name}" 
                     id="main-product-image">
            </div>
            ${product.images.length > 1 ? `
                <div class="image-thumbnails">
                    ${product.images.map((image, index) => `
                        <img src="${image.url}" 
                             alt="${product.name}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             onclick="changeMainImage('${image.url}', this)">
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="product-details-info">
            <nav class="breadcrumb">
                <a href="/">Home</a> > 
                <a href="/?category=${product.category}">${product.category}</a> > 
                <span>${product.name}</span>
            </nav>
            
            <h1>${product.name}</h1>
            
            <div class="product-rating">
                ${generateStarRating(product.ratings?.average || 0)}
                <span class="rating-text">
                    ${product.ratings?.average?.toFixed(1) || '0.0'} 
                    (${product.ratings?.count || 0} reviews)
                </span>
            </div>
            
            <div class="price-section">
                <div class="price">$${product.price.toFixed(2)}</div>
                ${product.brand ? `<div class="brand">Brand: ${product.brand}</div>` : ''}
            </div>
            
            <div class="product-description">
                <h3>Description</h3>
                <p>${product.description}</p>
            </div>
            
            ${product.specifications && product.specifications.length > 0 ? `
                <div class="product-specifications">
                    <h3>Specifications</h3>
                    <table class="specs-table">
                        ${product.specifications.map(spec => `
                            <tr>
                                <td>${spec.name}</td>
                                <td>${spec.value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            ` : ''}
            
            <div class="product-meta">
                <div class="stock-info ${product.stock <= 5 ? 'low-stock' : ''}">
                    ${product.stock > 0 ? 
                        `<span class="stock-available">✓ ${product.stock} in stock</span>` : 
                        `<span class="stock-unavailable">✗ Out of stock</span>`
                    }
                    ${product.stock <= 5 && product.stock > 0 ? 
                        `<span class="low-stock-warning">Only ${product.stock} left!</span>` : ''
                    }
                </div>
                <div class="sku">SKU: ${product.sku || 'N/A'}</div>
                <div class="category">Category: 
                    <a href="/?category=${product.category}">${product.category}</a>
                </div>
            </div>
            
            <div class="purchase-section">
                <div class="quantity-selector">
                    <label for="quantity">Quantity:</label>
                    <div class="quantity-controls">
                        <button type="button" onclick="changeQuantity(-1)" ${product.stock === 0 ? 'disabled' : ''}>−</button>
                        <input type="number" id="quantity" min="1" max="${product.stock}" value="1" 
                               ${product.stock === 0 ? 'disabled' : ''}>
                        <button type="button" onclick="changeQuantity(1)" ${product.stock === 0 ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary add-to-cart-btn" 
                            onclick="addToCartWithQuantity('${product._id}')"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="btn btn-success buy-now-btn" 
                            onclick="buyNow('${product._id}')"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        Buy Now
                    </button>
                </div>
            </div>
            
            <div class="product-actions-secondary">
                <button class="btn btn-outline" onclick="window.history.back()">
                    ← Back to Products
                </button>
                <button class="btn btn-outline" onclick="shareProduct()">
                    Share Product
                </button>
            </div>
        </div>
    `;
}

// Change main product image
function changeMainImage(imageUrl, thumbnail) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    mainImage.src = imageUrl;
    
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '☆';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }
    
    return `<div class="star-rating">${starsHTML}</div>`;
}

// Change quantity
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value) || 1;
    const newValue = currentValue + delta;
    const maxValue = parseInt(quantityInput.max) || 1;
    
    if (newValue >= 1 && newValue <= maxValue) {
        quantityInput.value = newValue;
    }
}

// Add to cart with specified quantity
async function addToCartWithQuantity(productId) {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!isAuthenticated()) {
        showNotification('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }
    
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const originalText = addToCartBtn.textContent;
    
    try {
        addToCartBtn.textContent = 'Adding...';
        addToCartBtn.disabled = true;
        
        const response = await makeAuthenticatedRequest('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                updateCartCount();
                showNotification(`${quantity} item(s) added to cart!`, 'success');
                addToCartBtn.textContent = '✓ Added to Cart';
                
                setTimeout(() => {
                    addToCartBtn.textContent = originalText;
                }, 2000);
            } else {
                showNotification(data.message, 'error');
            }
        } else {
            throw new Error('Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    } finally {
        addToCartBtn.disabled = false;
        setTimeout(() => {
            if (addToCartBtn.textContent !== originalText) {
                addToCartBtn.textContent = originalText;
            }
        }, 2000);
    }
}

// Buy now functionality
async function buyNow(productId) {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (!isAuthenticated()) {
        showNotification('Please login to purchase', 'warning');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
        return;
    }
    
    try {
        // Add to cart first
        const response = await makeAuthenticatedRequest('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                // Redirect to checkout
                window.location.href = '/checkout';
            } else {
                showNotification(data.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error with buy now:', error);
        showNotification('Error processing purchase', 'error');
    }
}

// Share product functionality
function shareProduct() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('Product link copied to clipboard!', 'success');
        });
    }
}

// Load related products
async function loadRelatedProducts(category, currentProductId) {
    try {
        const response = await fetch(`/api/products?category=${category}&limit=4`);
        const data = await response.json();
        
        if (data.success) {
            const relatedProducts = data.data.products.filter(p => p._id !== currentProductId);
            
            if (relatedProducts.length > 0) {
                displayRelatedProducts(relatedProducts.slice(0, 3));
            }
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products
function displayRelatedProducts(products) {
    const container = document.getElementById('product-details');
    
    const relatedHTML = `
        <div class="related-products">
            <h3>Related Products</h3>
            <div class="related-products-grid">
                ${products.map(product => `
                    <div class="related-product-card">
                        <a href="/product/${product._id}">
                            <img src="${product.images[0]?.url || 'https://via.placeholder.com/200'}" 
                                 alt="${product.name}">
                            <h4>${product.name}</h4>
                            <div class="price">$${product.price.toFixed(2)}</div>
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', relatedHTML);
}

// Initialize product details page
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
});