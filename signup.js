document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signup-form");
  
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
  
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const phone = document.getElementById("phone").value;
  
        try {
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, phone }),
            });
  
            const data = await response.json();
  
            if (response.ok) {
                alert("Signup successful! Please login.");
                window.location.href = "login.html"; // Redirect to login page
            } else {
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
  });