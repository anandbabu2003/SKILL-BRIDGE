const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./user");
const Employer = require("./employer");
const Worker = require("./worker");

const app = express();
const PORT = 5000;
const JWT_SECRET = "your_jwt_secret"; // Change this to a secure key

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://002anandbabu:anandbabu@cluster0.c161u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// User Signup Route
app.post("/api/signup", async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, phone });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// User Login Route
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        // Check if user is an employer
        const employer = await Employer.findOne({ email });
        if (employer) {
            return res.json({ 
                message: "Login successful", 
                user, 
                token, 
                role: "employer", 
                employerId: employer._id 
            });
        }

        // Check if user is a worker
        const worker = await Worker.findOne({ email });
        if (worker) {
            return res.json({ 
                message: "Login successful", 
                user, 
                token, 
                role: "worker", 
                workerId: worker._id 
            });
        }

        res.json({ message: "Login successful", user, token, role: "user" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* ===================== Employer Routes ===================== */

// Post a Job
app.post("/api/employer/post-job", async (req, res) => {
    const { employerId, jobType, location, duration } = req.body;

    try {
        const employer = await Employer.findById(employerId);
        if (!employer) return res.status(404).json({ message: "Employer not found" });

        employer.jobPosts.push({ jobType, location, duration });
        await employer.save();

        res.status(201).json({ message: "Job posted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get Jobs Posted by Employer
app.get("/api/employer/jobs/:employerId", async (req, res) => {
    try {
        const employer = await Employer.findById(req.params.employerId);
        if (!employer) return res.status(404).json({ message: "Employer not found" });

        res.json(employer.jobPosts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get Job Applications
app.get("/api/employer/job-applications/:employerId", async (req, res) => {
    try {
        const employer = await Employer.findById(req.params.employerId).populate("jobPosts.applications");
        if (!employer) return res.status(404).json({ message: "Employer not found" });

        res.json(employer.jobPosts);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Send Proposal to Worker
app.post("/api/employer/send-proposal", async (req, res) => {
    const { employerId, workerId, jobDetails } = req.body;

    try {
        const employer = await Employer.findById(employerId);
        const worker = await Worker.findById(workerId);

        if (!employer || !worker) return res.status(404).json({ message: "Employer or Worker not found" });

        employer.proposalsSent.push({ workerId, jobDetails });
        worker.proposalsReceived.push({ employerId, jobDetails });

        await employer.save();
        await worker.save();

        res.json({ message: "Proposal sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/* ===================== Worker Routes ===================== */

// Get Available Jobs
app.get("/api/worker/jobs", async (req, res) => {
    try {
        const employers = await Employer.find();
        const jobs = employers.flatMap(emp => emp.jobPosts);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Apply for a Job
app.post("/api/worker/apply-job", async (req, res) => {
    const { workerId, employerId, jobId } = req.body;

    try {
        const employer = await Employer.findById(employerId);
        const worker = await Worker.findById(workerId);

        if (!employer || !worker) return res.status(404).json({ message: "Employer or Worker not found" });

        worker.jobApplications.push({ jobId, employerId, status: "Pending" });
        await worker.save();

        res.json({ message: "Job application submitted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get Worker Proposals
app.get("/api/worker/proposals/:workerId", async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.workerId).populate("proposalsReceived.employerId");
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        res.json(worker.proposalsReceived);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Accept/Reject Proposal
app.post("/api/worker/respond-proposal", async (req, res) => {
    const { workerId, proposalId, status } = req.body;

    try {
        const worker = await Worker.findById(workerId);
        if (!worker) return res.status(404).json({ message: "Worker not found" });

        const proposal = worker.proposalsReceived.id(proposalId);
        if (!proposal) return res.status(404).json({ message: "Proposal not found" });

        proposal.status = status;
        await worker.save();

        res.json({ message: `Proposal ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
