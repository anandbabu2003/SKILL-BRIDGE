const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true }, // Reference to Job
  workerName: { type: String, required: true }, // Worker applying
  appliedAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Application", ApplicationSchema);
