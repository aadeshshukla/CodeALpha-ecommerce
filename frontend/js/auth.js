// Authentication utilities and functions

// API Base URL
const API_BASE_URL = '/api';

// Token management
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function isAuthenticated() {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
}

// API request helper with authentication
async function makeAuthenticatedRequest(url, options = {}) {
    const token = getToken();
    
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

    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle token expiration
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
            return null;
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            setToken(data.data.token);
            setUser(data.data.user);
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            setToken(data.data.token);
            setUser(data.data.user);
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: data.message, errors: data.errors };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Logout function
async function logout() {
    try {
        const token = getToken();
        if (token) {
            await makeAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, {
                method: 'POST'
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        removeToken();
        window.location.href = '/';
    }
}

// Get current user profile
async function getCurrentUser() {
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                setUser(data.data.user);
                return data.data.user;
            }
        }
        return null;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

// Update user profile
async function updateProfile(profileData) {
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        const data = await response.json();
        
        if (data.success) {
            setUser(data.data.user);
            return { success: true, user: data.data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/users/password`, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        return { success: data.success, message: data.message };
    } catch (error) {
        console.error('Change password error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Initialize navigation based on authentication status
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

// Toggle user dropdown menu
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize login form
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        
        try {
            const result = await login(email, password);
            
            if (result.success) {
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Login failed. Please try again.', 'error');
        } finally {
            // Hide loading state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    });
}

// Initialize register form
function initializeRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const registerBtn = document.getElementById('register-btn');
    
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: password
        };
        
        // Show loading state
        registerBtn.classList.add('loading');
        registerBtn.disabled = true;
        
        try {
            const result = await register(userData);
            
            if (result.success) {
                showNotification('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                if (result.errors && result.errors.length > 0) {
                    const errorMessages = result.errors.map(err => err.msg).join(', ');
                    showNotification(errorMessages, 'error');
                } else {
                    showNotification(result.message, 'error');
                }
            }
        } catch (error) {
            showNotification('Registration failed. Please try again.', 'error');
        } finally {
            // Hide loading state
            registerBtn.classList.remove('loading');
            registerBtn.disabled = false;
        }
    });
}

// Initialize profile page
function initializeProfilePage() {
    initializeNavigation();
    loadUserProfile();
    initializeProfileTabs();
    initializeProfileForm();
    initializePasswordForm();
    loadOrderHistory();
}

// Load user profile data
async function loadUserProfile() {
    const user = await getCurrentUser();
    if (!user) return;

    // Populate form fields
    const fields = ['firstName', 'lastName', 'email', 'phone'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && user[field]) {
            element.value = user[field];
        }
    });

    // Populate address fields
    if (user.address) {
        const addressFields = ['street', 'city', 'state', 'zipCode', 'country'];
        addressFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && user.address[field]) {
                element.value = user.address[field];
            }
        });
    }
}

// Initialize profile tabs
function initializeProfileTabs() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            if (!targetTab) return;
            
            // Remove active class from all links and tabs
            menuLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize profile form
function initializeProfileForm() {
    const profileForm = document.getElementById('profile-form');
    
    if (!profileForm) return;

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(profileForm);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('address.street'),
                city: formData.get('address.city'),
                state: formData.get('address.state'),
                zipCode: formData.get('address.zipCode'),
                country: formData.get('address.country')
            }
        };
        
        const result = await updateProfile(profileData);
        
        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            initializeNavigation(); // Refresh navigation with updated user data
        } else {
            showNotification(result.message, 'error');
        }
    });
}

// Initialize password form
function initializePasswordForm() {
    const passwordForm = document.getElementById('password-form');
    
    if (!passwordForm) return;

    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(passwordForm);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');
        
        // Validate password confirmation
        if (newPassword !== confirmNewPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        const result = await changePassword(currentPassword, newPassword);
        
        if (result.success) {
            showNotification('Password changed successfully!', 'success');
            passwordForm.reset();
        } else {
            showNotification(result.message, 'error');
        }
    });
}

// Load order history
async function loadOrderHistory(page = 1) {
    const ordersContainer = document.getElementById('orders-container');
    const ordersLoading = document.getElementById('orders-loading');
    
    if (!ordersContainer) return;

    try {
        ordersLoading.style.display = 'block';
        
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/orders?page=${page}&limit=10`);
        
        if (response && response.ok) {
            const data = await response.json();
            
            if (data.success && data.data.orders.length > 0) {
                ordersContainer.innerHTML = data.data.orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-info">
                                <h4>Order #${order.orderNumber}</h4>
                                <p>Placed on ${new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div class="order-info">
                                <h4>Total: $${order.total.toFixed(2)}</h4>
                                <p>${order.items.length} item(s)</p>
                            </div>
                            <div class="order-info">
                                <span class="order-status ${order.status}">${order.status}</span>
                            </div>
                            <div class="order-actions">
                                <button class="btn btn-secondary btn-sm" onclick="toggleOrderDetails('${order._id}')">
                                    View Details
                                </button>
                            </div>
                        </div>
                        <div class="order-items" id="order-items-${order._id}" style="display: none;">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                                    <div class="order-item-info">
                                        <h5>${item.name}</h5>
                                        <p>Quantity: ${item.quantity}</p>
                                    </div>
                                    <div class="order-item-price">
                                        $${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                
                // Add pagination if needed
                if (data.data.pagination.totalPages > 1) {
                    document.getElementById('orders-pagination').innerHTML = generatePagination(data.data.pagination, page);
                }
            } else {
                ordersContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>No orders found</h3>
                        <p>You haven't placed any orders yet.</p>
                        <a href="/" class="btn btn-primary">Start Shopping</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Load order history error:', error);
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <h3>Error loading orders</h3>
                <p>Please try again later.</p>
            </div>
        `;
    } finally {
        ordersLoading.style.display = 'none';
    }
}

// Toggle order details
function toggleOrderDetails(orderId) {
    const orderItems = document.getElementById(`order-items-${orderId}`);
    if (orderItems) {
        orderItems.style.display = orderItems.style.display === 'none' ? 'block' : 'none';
    }
}

// Generate pagination HTML
function generatePagination(pagination, currentPage) {
    let html = '<div class="pagination">';
    
    // Previous button
    if (pagination.hasPrev) {
        html += `<button class="btn btn-secondary" onclick="loadOrderHistory(${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-current">${i}</span>`;
        } else {
            html += `<button class="btn btn-outline" onclick="loadOrderHistory(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (pagination.hasNext) {
        html += `<button class="btn btn-secondary" onclick="loadOrderHistory(${currentPage + 1})">Next</button>`;
    }
    
    html += '</div>';
    return html;
}

// Update cart count for authenticated users
async function updateCartCount() {
    if (!isAuthenticated()) return;

    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/cart`);
        
        if (response && response.ok) {
            const data = await response.json();
            
            if (data.success) {
                const totalItems = data.data.cart.items.reduce((total, item) => total + item.quantity, 0);
                const cartCountElement = document.getElementById('cart-count');
                if (cartCountElement) {
                    cartCountElement.textContent = totalItems;
                }
            }
        }
    } catch (error) {
        console.error('Update cart count error:', error);
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});