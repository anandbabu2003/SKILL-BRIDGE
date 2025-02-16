const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    employerEmail: { type: String, required: true }, // Employer's email
    jobTitle: { type: String, required: true },
    jobDescription: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
