document.addEventListener("DOMContentLoaded", function() {
    const jobForm = document.getElementById("job-form");
    const jobsList = document.getElementById("jobs-list");
    const searchButton = document.getElementById("search-button");
    const workersList = document.getElementById("workers-list");
    const ratingForm = document.getElementById("rating-form");

    // ✅ Fetch and display jobs
    async function loadJobs() {
        try {
            const response = await fetch("http://localhost:5000/jobs");
            const jobs = await response.json();
            jobsList.innerHTML = "";

            jobs.forEach(job => {
                const jobElement = document.createElement("div");
                jobElement.classList.add("job-card"); // Added a class for styling
                jobElement.innerHTML = `<strong>${job.title}</strong> - ${job.description} (${job.duration} days) at ${job.location}`;
                jobsList.appendChild(jobElement);
            });
        } catch (error) {
            console.error("Error loading jobs:", error);
        }
    }

    // ✅ Submit job posting
    jobForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const jobData = {
            title: document.getElementById("job-title").value,
            description: document.getElementById("job-description").value,
            location: document.getElementById("job-location").value,
            duration: document.getElementById("job-duration").value
        };

        try {
            const response = await fetch("http://localhost:5000/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobData)
            });

            if (!response.ok) throw new Error("Failed to post job");

            jobForm.reset();
            loadJobs();
        } catch (error) {
            console.error("Error posting job:", error);
        }
    });

    // ✅ Search for workers by location
    searchButton.addEventListener("click", async function() {
        const searchLocation = document.getElementById("search-location").value.toLowerCase();

        try {
            const response = await fetch(`http://localhost:5000/workers?location=${searchLocation}`);
            const workers = await response.json();
            workersList.innerHTML = "";

            workers.forEach(worker => {
                const workerElement = document.createElement("div");
                workerElement.classList.add("worker-card"); // Added a class for styling
                workerElement.innerHTML = `<strong>${worker.name}</strong> - ${worker.location}`;
                workersList.appendChild(workerElement);
            });
        } catch (error) {
            console.error("Error fetching workers:", error);
        }
    });

    // ✅ Submit worker rating
    ratingForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const ratingData = {
            name: document.getElementById("worker-name").value,
            rating: document.getElementById("worker-rating").value
        };

        try {
            const response = await fetch("http://localhost:5000/rate-worker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ratingData)
            });

            if (!response.ok) throw new Error("Failed to submit rating");

            alert("Rating submitted successfully!");
            ratingForm.reset();
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    });

    // ✅ Load jobs when the page loads
    loadJobs();
});
