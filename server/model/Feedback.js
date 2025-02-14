const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  experienceRating: String,
  satisfactionRating: String,
  usefulFeedback: String,
  improvementSuggestions: String,
  recommendation: String,
});

module.exports = mongoose.model("Feedback", feedbackSchema);
