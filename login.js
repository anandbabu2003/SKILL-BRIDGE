document.addEventListener("DOMContentLoaded", function () { 
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.user) {
                // Clear previous localStorage data before saving new values
                localStorage.clear();

                // Store essential user details
                localStorage.setItem("userEmail", data.user.email);
                localStorage.setItem("userId", data.user._id);
                localStorage.setItem("token", data.token);

                // Redirect to role selection page
                alert("Login successful! Please select your role.");
                window.location.href = "role.html";  
            } else {
                alert(data.message || "Invalid login credentials.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
