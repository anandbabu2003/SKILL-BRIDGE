document.addEventListener('DOMContentLoaded', () => {
    // Get form and input elements
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const phoneInput = document.getElementById('phone');
    const signupButton = signupForm.querySelector('button');
    const errorMessageElement = document.createElement('div'); // For dynamic error display

    // Add error message container to the form (for better UX)
    signupForm.appendChild(errorMessageElement);

    // Form submission event handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();  // Prevent default form submission

        // Remove any existing error messages
        errorMessageElement.innerHTML = '';

        // Trim input values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const phone = phoneInput.value.trim();

        // Basic form validation with feedback
        if (!name || !email || !password || !phone) {
            showError('Please fill in all fields.');
            return;
        }

        // Add spinner to button to show loading state
        signupButton.disabled = true;
        signupButton.innerHTML = 'Creating Account...';

        // Prepare data for submission
        const signupData = {
            name: name,
            email: email,
            password: password,
            phone: phone
        };

        try {
            // Sending signup data to backend using Fetch API
            const response = await fetch('http://localhost:5000/signup', {  // Update to your backend API URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });

            const data = await response.json();

            // Check for successful signup response
            if (response.ok) {
                // Display success message (optional)
                alert(data.message || 'Signup successful! Redirecting to login page.');

                // Redirect to login page after successful signup
                window.location.href = '/login.html';  // Adjust this URL to your actual login page
            } else {
                // Display error message for signup failure
                showError(data.message || 'There was an error creating your account.');
            }
        } catch (error) {
            // Handle any server-side issues or network errors
            showError('There was an error. Please try again later.');
        } finally {
            // Reset the form to its original state
            signupButton.innerHTML = 'Sign Up';
            signupButton.disabled = false;
        }
    });

    // Function to show error messages
    function showError(message) {
        errorMessageElement.innerHTML = `<div class="error-message"><strong>Error:</strong> ${message}</div>`;
        errorMessageElement.classList.add('visible');
    }
});
