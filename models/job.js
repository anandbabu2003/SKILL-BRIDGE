const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: Number, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to Employer
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", JobSchema);
