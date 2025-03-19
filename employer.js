const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true },
    jobPosts: [
        {
            jobType: String,
            location: String,
            duration: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    proposalsSent: [
        {
            workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
            jobDetails: String,
            status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    reviews: [
        {
            workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
            reviewText: String,
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model("Employer", EmployerSchema);
