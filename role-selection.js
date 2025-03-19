// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Get the buttons by their IDs
    const workerBtn = document.getElementById("workerBtn");
    const employerBtn = document.getElementById("employerBtn");

    // Redirect to the worker page when the "WORKER" button is clicked
    workerBtn.addEventListener("click", function () {
        window.location.href = "worker.html";
    });

    // Redirect to the employer page when the "EMPLOYER" button is clicked
    employerBtn.addEventListener("click", function () {
        window.location.href = "employer.html";
    });
});
