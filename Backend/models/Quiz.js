const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('Quiz', quizSchema);