document.addEventListener('DOMContentLoaded', () => {
    // Get form and input elements
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginButton = loginForm.querySelector('button');
    const errorMessageElement = document.createElement('div'); // For dynamic error display

    // Add error message container to the form (for better UX)
    loginForm.appendChild(errorMessageElement);

    // Form submission event handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // Prevent default form submission

        // Remove any existing error messages
        errorMessageElement.innerHTML = '';

        // Trim input values
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        // Basic form validation with feedback
        if (!email || !password) {
            showError('Please fill in both email and password.');
            return;
        }

        // Add spinner to button to show loading state
        loginButton.disabled = true;
        loginButton.innerHTML = 'Logging in...';

        // Prepare data for submission
        const loginData = {
            email: email,
            password: password,
            rememberMe: rememberMeCheckbox.checked
        };

        try {
            // Sending login data to backend using Fetch API
            const response = await fetch('http://localhost:5000/login', {  // Update to your backend API URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            // Check for successful login response
            if (response.ok) {
                // Handle Remember Me functionality - save email in localStorage
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('email', email);
                }

                // Save JWT token in localStorage (optional, for future API requests)
                localStorage.setItem('token', data.token);

                // Optionally store role in localStorage (to be used in role selection page)
                localStorage.setItem('role', data.role); // 'worker' or 'employer'

                // Clear loading state
                loginButton.innerHTML = 'Login';
                loginButton.disabled = false;

                // Redirect user to role selection page
                window.location.href = '/role.html';  // Redirect to the role selection page
            } else {
                // Display error message for login failure
                showError(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            // Handle any server-side issues or network errors
            showError('There was an error. Please try again later.');
        } finally {
            // Reset the form to its original state
            loginButton.innerHTML = 'Login';
            loginButton.disabled = false;
        }
    });

    // Function to show error messages
    function showError(message) {
        errorMessageElement.innerHTML = `<div class="error-message"><strong>Error:</strong> ${message}</div>`;
        errorMessageElement.classList.add('visible');
    }

    // Check for Remember Me stored email on page load
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
        loginEmail.value = storedEmail;
        rememberMeCheckbox.checked = true;
    }
});
