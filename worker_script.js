document.addEventListener("DOMContentLoaded", () => {
    const jobList = document.getElementById("job-list");
    const profileForm = document.getElementById("worker-profile-form");

    // Fetch available jobs from the backend
    async function fetchJobs() {
        try {
            const response = await fetch("http://localhost:5000/jobs"); // Ensure this matches your backend route
            const jobs = await response.json();
            displayJobs(jobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    }

    function displayJobs(jobs) {
        jobList.innerHTML = "";
        jobs.forEach(job => {
            const jobDiv = document.createElement("div");
            jobDiv.classList.add("job");
            jobDiv.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Employer:</strong> ${job.employer || "Unknown"}</p>
                <button class="apply-btn" onclick="applyForJob('${job._id}')">Apply</button>
            `;
            jobList.appendChild(jobDiv);
        });
    }

    // Apply for a job
    window.applyForJob = async function(jobId) {
        try {
            const workerName = localStorage.getItem("workerName");
            if (!workerName) {
                alert("Please create a profile first!");
                return;
            }

            const response = await fetch("http://localhost:5000/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId, workerName }),
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error applying for job:", error);
        }
    };

    // Save worker profile to the database
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const workerData = {
            name: document.getElementById("name").value,
            job: document.getElementById("job").value,
            skills: document.getElementById("skills").value.split(",").map(skill => skill.trim()),
            location: document.getElementById("location").value
        };

        try {
            const response = await fetch("http://localhost:5000/workers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(workerData),
            });

            const result = await response.json();
            alert(result.message);
            localStorage.setItem("workerName", workerData.name); // Save worker name for applications
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    });

    fetchJobs(); // Load jobs on page load
});