const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
    name: String,
    location: String,
    ratings: [Number] // Store worker ratings
});

module.exports = mongoose.model("Worker", WorkerSchema);
