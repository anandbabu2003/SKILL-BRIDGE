const API_URL = "http://localhost:5000/api";

// Function to switch between sections
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

// ====================== Worker Functionalities ====================== //

// 1️⃣ Fetch Available Jobs
async function fetchAvailableJobs() {
    const response = await fetch(`${API_URL}/worker/jobs`);
    const jobs = await response.json();

    let jobList = document.getElementById("workerJobList");
    jobList.innerHTML = "";

    jobs.forEach(job => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${job.jobType} - ${job.location} - ${job.duration}`;
        jobList.appendChild(listItem);
    });
}

// 2️⃣ Apply for a Job
async function applyForJob(jobId, employerId) {
    const workerId = localStorage.getItem("workerId");

    const response = await fetch(`${API_URL}/worker/apply-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, employerId, jobId })
    });

    const data = await response.json();
    alert(data.message);
}

// 3️⃣ Fetch Worker Proposals
async function fetchWorkerProposals() {
    const workerId = localStorage.getItem("workerId");

    const response = await fetch(`${API_URL}/worker/proposals/${workerId}`);
    const proposals = await response.json();

    let proposalList = document.getElementById("proposalList");
    proposalList.innerHTML = "";

    proposals.forEach(proposal => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `Job: ${proposal.jobDetails.jobType} - Status: ${proposal.status}`;
        proposalList.appendChild(listItem);
    });
}

// 4️⃣ Accept/Reject Proposal
async function respondToProposal(proposalId, status) {
    const workerId = localStorage.getItem("workerId");

    const response = await fetch(`${API_URL}/worker/respond-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, proposalId, status })
    });

    const data = await response.json();
    alert(data.message);
}

// Call functions on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchAvailableJobs();
    fetchWorkerProposals();
});
