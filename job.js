const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    duration: Number
});

module.exports = mongoose.model("Job", JobSchema);
