const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true },
    skills: { type: String, required: true },
    experience: { type: String, required: true },
    jobApplications: [
        {
            jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
            employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },
            status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
            appliedAt: { type: Date, default: Date.now }
        }
    ],
    proposalsReceived: [
        {
            employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },
            jobDetails: String,
            status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
            receivedAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Worker", WorkerSchema);
