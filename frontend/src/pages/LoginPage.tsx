<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alumni Portal - Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        :root {
            --primary-color: #3498db;
            --primary-dark: #2980b9;
            --error-color: #e74c3c;
            --success-color: #2ecc71;
            --border-color: #ddd;
            --text-color: #333;
            --text-secondary: #666;
            --bg-color: #f5f7fa;
            --card-bg: white;
        }
        
        body {
            background-color: var(--bg-color);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            width: 100%;
            max-width: 400px;
            padding: 20px;
        }
        
        .login-card {
            background-color: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }
        
        .logo-container {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .logo {
            width: 120px;
            height: 120px;
            background-color: var(--primary-color);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 36px;
            font-weight: bold;
        }
        
        h1 {
            text-align: center;
            color: var(--text-color);
            margin-bottom: 25px;
            font-size: 24px;
        }
        
        .form-group {
            margin-bottom: 20px;
            position: relative;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        input[type="email"],
        input[type="password"],
        input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        input[type="email"]:focus,
        input[type="password"]:focus,
        input[type="text"]:focus {
            border-color: var(--primary-color);
            outline: none;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .input-icon {
            position: absolute;
            right: 15px;
            top: 38px;
            color: var(--text-secondary);
        }
        
        .toggle-password {
            cursor: pointer;
        }
        
        .forgot-password {
            text-align: right;
            margin-top: 5px;
        }
        
        .forgot-password a {
            color: var(--primary-color);
            font-size: 13px;
            text-decoration: none;
        }
        
        .forgot-password a:hover {
            text-decoration: underline;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s;
            position: relative;
        }
        
        .btn:hover {
            background-color: var(--primary-dark);
        }
        
        .btn:disabled {
            background-color: #a0cfee;
            cursor: not-allowed;
        }
        
        .btn .spinner {
            display: none;
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to {
                transform: translateY(-50%) rotate(360deg);
            }
        }
        
        .alert {
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            display: none;
        }
        
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .register-link {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .register-link a {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 500;
        }
        
        .register-link a:hover {
            text-decoration: underline;
        }
        
        .divider {
            margin: 25px 0;
            text-align: center;
            position: relative;
        }
        
        .divider::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: var(--border-color);
        }
        
        .divider span {
            position: relative;
            background-color: var(--card-bg);
            padding: 0 15px;
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .social-login {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #f5f5f5;
            border: 1px solid #eee;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .social-btn:hover {
            background-color: #e5e5e5;
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .google-btn { color: #DB4437; }
        .linkedin-btn { color: #0077B5; }
        .facebook-btn { color: #3b5998; }
        
        .remember-container {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .checkbox-container {
            display: flex;
            align-items: center;
        }
        
        .checkbox-container input[type="checkbox"] {
            margin-right: 8px;
        }
        
        .checkbox-container label {
            margin-bottom: 0;
            font-size: 14px;
            color: var(--text-secondary);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-card">
            <div class="logo-container">
                <div class="logo">AP</div>
            </div>
            <h1>Alumni Portal Login</h1>
            
            <div id="alert-container" class="alert"></div>
            
            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email">
                    <i class="fas fa-envelope input-icon"></i>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Enter your password">
                    <i class="fas fa-eye toggle-password input-icon" id="toggle-password"></i>
                    <div class="forgot-password">
                        <a href="/api/auth/forgot-password">Forgot password?</a>
                    </div>
                </div>
                
                <div class="remember-container">
                    <div class="checkbox-container">
                        <input type="checkbox" id="remember" name="remember">
                        <label for="remember">Remember me</label>
                    </div>
                </div>
                
                <button type="submit" class="btn" id="login-btn">
                    Log In
                    <span class="spinner"></span>
                </button>
            </form>
            
            <div class="divider">
                <span>OR</span>
            </div>
            
            <div class="social-login">
                <div class="social-btn google-btn" id="google-login">
                    <i class="fab fa-google"></i>
                </div>
                <div class="social-btn linkedin-btn" id="linkedin-login">
                    <i class="fab fa-linkedin-in"></i>
                </div>
                <div class="social-btn facebook-btn" id="facebook-login">
                    <i class="fab fa-facebook-f"></i>
                </div>
            </div>
            
            <div class="register-link">
                Don't have an account? <a href="/api/auth/register">Register now</a>
            </div>
        </div>
    </div>

    <script>
        // DOM Elements
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const spinner = document.querySelector('.spinner');
        const alertContainer = document.getElementById('alert-container');
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        
        // Base API URL - Change this to match your backend
        const API_BASE_URL = '/api';
        
        // Show alert function
        function showAlert(message, type) {
            alertContainer.textContent = message;
            alertContainer.className = `alert alert-${type}`;
            alertContainer.style.display = 'block';
            
            // Auto hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    alertContainer.style.display = 'none';
                }, 5000);
            }
        }
        
        // Toggle password visibility
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
        
        // Check for existing token on page load
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Validate token
                fetch(`${API_BASE_URL}/auth/validate-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Token is valid, redirect to dashboard
                        window.location.href = '/dashboard';
                    } else {
                        // Invalid token, remove it
                        localStorage.removeItem('auth_token');
                    }
                })
                .catch(err => {
                    console.error('Token validation error:', err);
                    localStorage.removeItem('auth_token');
                });
            }
            
            // Check for OAuth redirect params
            const urlParams = new URLSearchParams(window.location.search);
            const oauthError = urlParams.get('oauth_error');
            const oauthSuccess = urlParams.get('oauth_success');
            
            if (oauthError) {
                showAlert(decodeURIComponent(oauthError), 'error');
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else if (oauthSuccess) {
                showAlert('Social login successful! Redirecting...', 'success');
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                // Get token from URL if available
                const token = urlParams.get('token');
                if (token) {
                    localStorage.setItem('auth_token', token);
                }
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }
        });
        
        // Handle login form submission
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous alerts
            alertContainer.style.display = 'none';
            
            // Form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Validate input
            if (!email || !password) {
                showAlert('Please enter both email and password', 'error');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            loginBtn.disabled = true;
            spinner.style.display = 'block';
            
            try {
                // Send login request
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        remember
                    }),
                    credentials: 'include' // Include cookies
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                
                // Store token if provided
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                
                // Show success message
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/dashboard';
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
                showAlert(error.message || 'An error occurred during login', 'error');
            } finally {
                // Reset button state
                loginBtn.disabled = false;
                spinner.style.display = 'none';
            }
        });
        
        // Social login handlers
        document.getElementById('google-login').addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/google`;
        });
        
        document.getElementById('linkedin-login').addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/linkedin`;
        });
        
        document.getElementById('facebook-login').addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/facebook`;
        });
    </script>
</body>
</html>
