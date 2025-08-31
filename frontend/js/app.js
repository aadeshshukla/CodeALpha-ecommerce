// Enhanced main application JavaScript with better error handling
let allProducts = [];
let currentPage = 1;
let totalPages = 1;
let currentCategory = '';
let currentSearch = '';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadProducts();
    setupSearch();
    setupCategoryFilter();
});

// Load products from API with better error handling
async function loadProducts(page = 1, category = '', search = '', sort = '-createdAt') {
    try {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = 'Loading products...';
        }

        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            limit: 12,
            sort: sort
        });

        if (category) params.append('category', category);
        if (search) params.append('search', search);

        console.log('🔄 Loading products with params:', params.toString());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`/api/products?${params}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allProducts = data.data.products;
            currentPage = data.data.pagination.currentPage;
            totalPages = data.data.pagination.totalPages;
            
            displayProducts(allProducts);
            displayPagination(data.data.pagination);
            
            console.log('✅ Products loaded successfully');
        } else {
            throw new Error(data.message || 'Failed to load products');
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            if (error.name === 'AbortError') {
                loadingElement.innerHTML = `
                    <div class="error-message">
                        <p>⏱️ Request timed out. Please check your connection and try again.</p>
                        <button class="btn btn-primary" onclick="loadProducts()">Retry</button>
                    </div>
                `;
            } else if (error.message.includes('DATABASE_TIMEOUT')) {
                loadingElement.innerHTML = `
                    <div class="error-message">
                        <p>🔄 Database is connecting. Please wait a moment and try again.</p>
                        <button class="btn btn-primary" onclick="loadProducts()">Retry</button>
                    </div>
                `;
            } else {
                loadingElement.innerHTML = `
                    <div class="error-message">
                        <p>❌ Error loading products: ${error.message}</p>
                        <button class="btn btn-primary" onclick="loadProducts()">Retry</button>
                    </div>
                `;
            }
        }
        
        // Show user-friendly notification
        showNotification('Failed to load products. Please try again.', 'error');
    }
}

// Rest of the app.js file remains the same...
// (keeping the previous implementation for other functions)

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading');
    
    if (loading) {
        loading.style.display = 'none';
    }
    
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your search or browse different categories.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product._id}">
            <img src="${product.images[0]?.url || 'https://via.placeholder.com/400x250'}" 
                 alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-meta">
                    <span class="product-category">${product.category}</span>
                    <span class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <a href="/product/${product._id}" class="btn btn-secondary">View Details</a>
                    <button onclick="addToCart('${product._id}')" 
                            class="btn btn-primary" 
                            ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Display pagination
function displayPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    if (pagination.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-controls">';
    
    // Previous button
    if (pagination.hasPrev) {
        html += `<button class="btn btn-outline" onclick="changePage(${pagination.currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);
    
    if (startPage > 1) {
        html += `<button class="btn btn-outline" onclick="changePage(1)">1</button>`;
        if (startPage > 2) html += '<span class="pagination-dots">...</span>';
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === pagination.currentPage) {
            html += `<button class="btn btn-primary pagination-current">${i}</button>`;
        } else {
            html += `<button class="btn btn-outline" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) html += '<span class="pagination-dots">...</span>';
        html += `<button class="btn btn-outline" onclick="changePage(${pagination.totalPages})">${pagination.totalPages}</button>`;
    }
    
    // Next button
    if (pagination.hasNext) {
        html += `<button class="btn btn-outline" onclick="changePage(${pagination.currentPage + 1})">Next</button>`;
    }
    
    html += '</div>';
    paginationContainer.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadProducts(page, currentCategory, currentSearch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add product to cart
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
                showNotification('Product added to cart!', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } else {
            throw new Error('Failed to add to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    function performSearch() {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts(1, currentCategory, currentSearch);
        
        // Update URL without refreshing page
        const url = new URL(window.location);
        if (currentSearch) {
            url.searchParams.set('search', currentSearch);
        } else {
            url.searchParams.delete('search');
        }
        window.history.pushState({}, '', url);
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Load search from URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        searchInput.value = searchParam;
        currentSearch = searchParam;
    }
}

// Setup category filter
function setupCategoryFilter() {
    // Add category filter UI if it exists
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 1;
            loadProducts(1, currentCategory, currentSearch);
        });
    }
}

// Initialize navigation (enhanced version)
function initializeNavigation() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const user = getUser();
    
    if (isAuthenticated() && user) {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/cart" id="cart-link">
                Cart (<span id="cart-count">0</span>)
            </a>
            <div class="user-menu">
                <button class="user-menu-toggle" onclick="toggleUserMenu()">
                    Welcome, ${user.firstName} ▼
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="/profile">My Profile</a>
                    <a href="/profile#order-history">Order History</a>
                    ${user.role === 'admin' ? '<a href="/admin">Admin Panel</a>' : ''}
                    <a href="#" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
        
        // Update cart count
        updateCartCount();
    } else {
        navLinks.innerHTML = `
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        `;
    }
}

// Helper functions from auth.js (if not imported)
if (typeof getUser === 'undefined') {
    function getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

if (typeof isAuthenticated === 'undefined') {
    function isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = getUser();
        return !!(token && user);
    }
}

if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}