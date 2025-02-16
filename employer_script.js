const API_URL = "http://localhost:5000/api";

// Function to switch between sections
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

// ====================== Employer Functionalities ====================== //

// 1️⃣ Post a Job
async function postJob() {
    const employerId = localStorage.getItem("employerId"); // Replace with actual logged-in employer ID
    const jobType = document.getElementById("jobType").value;
    const location = document.getElementById("jobLocation").value;
    const duration = document.getElementById("jobDuration").value;

    const response = await fetch(`${API_URL}/employer/post-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId, jobType, location, duration })
    });

    const data = await response.json();
    alert(data.message);
}

// 2️⃣ Fetch Job Applications
async function fetchJobApplications() {
    const employerId = localStorage.getItem("employerId");
    
    const response = await fetch(`${API_URL}/employer/job-applications/${employerId}`);
    const applications = await response.json();

    let applicationList = document.getElementById("applicationsList");
    applicationList.innerHTML = "";

    applications.forEach(app => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${app.jobType} - ${app.location} - <strong>${app.status}</strong>`;
        applicationList.appendChild(listItem);
    });
}

// 3️⃣ Send Proposal to Worker
async function sendProposal(workerId, jobDetails) {
    const employerId = localStorage.getItem("employerId");

    const response = await fetch(`${API_URL}/employer/send-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerId, workerId, jobDetails })
    });

    const data = await response.json();
    alert(data.message);
}

// 4️⃣ Fetch Proposals Sent to Workers
async function fetchWorkerProposals() {
    const employerId = localStorage.getItem("employerId");

    const response = await fetch(`${API_URL}/employer/jobs/${employerId}`);
    const jobs = await response.json();

    let proposalList = document.getElementById("proposalList");
    proposalList.innerHTML = "";

    jobs.forEach(job => {
        job.applications.forEach(application => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `Worker: ${application.workerId} - Status: ${application.status}`;
            proposalList.appendChild(listItem);
        });
    });
}

// Call functions on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchJobApplications();
    fetchWorkerProposals();
});
