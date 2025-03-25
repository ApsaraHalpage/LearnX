const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);