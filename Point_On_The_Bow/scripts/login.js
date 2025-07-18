// DOM Elements
const loginForm = document.getElementById('loginForm');
const registrationForm = document.getElementById('registrationForm');
const loginFormContainer = document.querySelector('.login-form-container');
const registrationFormContainer = document.getElementById('registrationFormContainer');
const showRegisterLink = document.getElementById('showRegisterForm');
const backToLoginLink = document.getElementById('backToLogin');
const passwordToggle = document.getElementById('passwordToggle');
const registerPasswordToggle = document.getElementById('registerPasswordToggle');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const loginFeatures = document.querySelector('.login-features');

// Helper function to show errors
function showError(message) {
    // Create or update error element
    let errorEl = document.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.style.cssText = 'background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
        loginForm.parentElement.insertBefore(errorEl, loginForm);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// Helper function to show success messages
function showSuccess(message) {
    // Create or update success element
    let successEl = document.querySelector('.success-message');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.className = 'success-message';
        successEl.style.cssText = 'background: #efe; border: 1px solid #cfc; color: #3c3; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 14px;';
        registrationForm.parentElement.insertBefore(successEl, registrationForm);
    }
    successEl.textContent = message;
    successEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 5000);
}

// Toggle between login and registration forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    loginFeatures.style.display = 'none';
    registrationFormContainer.style.display = 'block';
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registrationFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
    loginFeatures.style.display = 'block';
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Password visibility toggle functions
function togglePasswordVisibility(inputId, toggleButton) {
    const input = document.getElementById(inputId);
    const icon = toggleButton.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Password visibility toggles
passwordToggle.addEventListener('click', () => {
    togglePasswordVisibility('password', passwordToggle);
});

registerPasswordToggle.addEventListener('click', () => {
    togglePasswordVisibility('registerPassword', registerPasswordToggle);
});

confirmPasswordToggle.addEventListener('click', () => {
    togglePasswordVisibility('confirmPassword', confirmPasswordToggle);
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = loginForm.querySelector('input[name="remember"]').checked;
    
    // Show loading state
    const submitButton = loginForm.querySelector('.btn-login');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitButton.disabled = true;
    
    try {
        // Authenticate using mock database
        const result = await mockDB.authenticateUser(email, password);
        
        if (result.success) {
            // Store user session
            const userData = {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                role: result.user.role,
                unitNumber: result.user.unitNumber,
                isAuthenticated: 'true'
            };
            
            // Store in session storage
            Object.keys(userData).forEach(key => {
                sessionStorage.setItem(key, userData[key]);
            });
            
            // If remember me is checked, also store in local storage
            if (rememberMe) {
                Object.keys(userData).forEach(key => {
                    localStorage.setItem(key, userData[key]);
                });
            }
            
            // Show success message
            submitButton.innerHTML = '<i class="fas fa-check"></i> Success!';
            submitButton.style.backgroundColor = '#10b981';
            
            // Redirect to portal after short delay
            setTimeout(() => {
                window.location.href = 'portal.html';
            }, 1000);
            
        } else {
            // Show error message
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
            
            // Display error
            showError(result.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '';
        showError('An error occurred. Please try again.');
    }
});

// Handle registration form submission
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(registrationForm);
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }
    
    // Show loading state
    const submitButton = registrationForm.querySelector('.btn-register');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitButton.disabled = true;
    
    try {
        // Create user data object
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: document.getElementById('registerEmail').value,
            unitNumber: formData.get('unitNumber'),
            phone: formData.get('phone'),
            password: password
        };
        
        // Register using mock database
        const result = await mockDB.createUser(userData);
        
        if (result.success) {
            // Show success message
            submitButton.innerHTML = '<i class="fas fa-check"></i> Account created!';
            submitButton.style.backgroundColor = '#10b981';
            showSuccess(result.message);
            
            // Reset form
            registrationForm.reset();
            
            // Switch back to login form after delay
            setTimeout(() => {
                registrationFormContainer.style.display = 'none';
                loginFormContainer.style.display = 'block';
                loginFeatures.style.display = 'block';
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                submitButton.style.backgroundColor = '';
            }, 2000);
            
        } else {
            // Show error
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
            showError(result.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '';
        showError('An error occurred. Please try again.');
    }
});

// Check if user came from register.html
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('register') === 'true') {
    // Show registration form
    loginFormContainer.style.display = 'none';
    loginFeatures.style.display = 'none';
    registrationFormContainer.style.display = 'block';
}

// Add input validation feedback
const inputs = document.querySelectorAll('input[required]');
inputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
}); 