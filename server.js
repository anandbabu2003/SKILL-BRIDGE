const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./user");

const app = express();
const PORT = 5000;
const JWT_SECRET = "your_jwt_secret"; // Change this to a secure key

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Removed deprecated options)
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
        res.json({ message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

const JobSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    duration: Number,
  });
  
  const WorkerSchema = new mongoose.Schema({
    name: String,
    job: String,
    skills: [String],
    location: String,
    rating: { type: Number, default: 0 },
    ratedBy: { type: Number, default: 0 },
  });
  
  const ApplicationSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    workerName: String,
  });
  
  // Models
  const Job = mongoose.model("Job", JobSchema);
  const Worker = mongoose.model("Worker", WorkerSchema);
  const Application = mongoose.model("Application", ApplicationSchema);
  
  // Routes
  
  // Post a Job
  app.post("/jobs", async (req, res) => {
    try {
      const newJob = new Job(req.body);
      await newJob.save();
      res.status(201).json({ message: "✅ Job posted successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get All Posted Jobs
  app.get("/jobs", async (req, res) => {
    try {
      const jobs = await Job.find();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Search Workers by Location
  app.get("/workers", async (req, res) => {
    try {
      const { location } = req.query;
      const workers = await Worker.find({ location: new RegExp(location, "i") });
      res.json(workers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Rate a Worker
  app.post("/rate-worker", async (req, res) => {
    try {
      const { name, rating } = req.body;
      const worker = await Worker.findOne({ name });
  
      if (worker) {
        worker.rating = ((worker.rating * worker.ratedBy) + rating) / (worker.ratedBy + 1);
        worker.ratedBy += 1;
        await worker.save();
      } else {
        await new Worker({ name, rating, ratedBy: 1 }).save();
      }
  
      res.json({ message: "✅ Worker rated successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Save Worker Profile
  app.post("/workers", async (req, res) => {
    try {
      const worker = new Worker(req.body);
      await worker.save();
      res.status(201).json({ message: "✅ Profile saved successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Worker applies for a job
  app.post("/apply", async (req, res) => {
    try {
      const { jobId, workerName } = req.body;
  
      // Check if the worker has already applied for this job
      const existingApplication = await Application.findOne({ jobId, workerName });
      if (existingApplication) {
        return res.status(400).json({ message: "⚠️ You have already applied for this job!" });
      }
  
      const application = new Application({ jobId, workerName });
      await application.save();
      res.json({ message: "✅ Job application submitted successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});