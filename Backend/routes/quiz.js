const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Upload course PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  const { name } = req.body;
  console.log('Received upload request:', { name, file: req.file?.originalname }); 
  if (!name || !req.file) {
    return res.status(400).json({ message: 'Course name and PDF are required' });
  }
  try {
    const pdfData = await pdfParse(req.file.buffer);
    console.log('PDF text extracted, length:', pdfData.text.length); 
    const course = new Course({
      name,
      pdf: req.file.buffer,
      pdfText: pdfData.text,
    });
    await course.save();
    console.log('Course saved with ID:', course._id); 
    res.json({ courseId: course._id });
  } catch (err) {
    console.error('Upload error:', err); 
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Generate quiz
router.post('/generate', async (req, res) => {
  const { courseId, difficulty } = req.body;
  console.log('Generate quiz request:', { courseId, difficulty });
  if (!courseId || !difficulty) {
    return res.status(400).json({ message: 'Course ID and difficulty are required' });
  }
  try {
    let questions = await Question.find({ courseId: new mongoose.Types.ObjectId(courseId), difficulty });
    console.log('Found questions:', questions.length);
    if (questions.length < 10) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      questions = await generateQuestions(course.pdfText, courseId, difficulty);
      console.log('Generated questions:', questions.length);
    }
    const sampledQuestions = questions.slice(0, 10);
    const questionIds = sampledQuestions.map(q => q._id);
    const quiz = new Quiz({ courseId, difficulty, questionIds });
    await quiz.save();
    res.json({ quizId: quiz._id });
  } catch (err) {
    console.error('Generate quiz error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get quiz (no auth required)
router.get('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questionIds');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Submit quiz (allow anonymous submissions)
router.post('/:quizId/submit', async (req, res) => {
  const { userId, answers } = req.body;
  console.log('Submit quiz request:', { userId, answers }); 
  if (!answers || answers.length === 0) {
    return res.status(400).json({ message: 'Answers are required' });
  }
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questionIds');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    let score = 0;
    quiz.questionIds.forEach(question => {
      const answer = answers.find(a => a.questionId === question._id.toString());
      if (answer && answer.selectedAnswer === question.correctAnswer) {
        score++;
      }
    });
    const attempt = new QuizAttempt({
      quizId: req.params.quizId,
      userId: userId || 'anonymous', // Default to 'anonymous' if no userId
      answers,
      score,
      completedAt: new Date(),
    });
    await attempt.save();
    res.json({ score });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Simple question generation function
async function generateQuestions(text, courseId, difficulty) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid PDF text');
  }
  const sentences = text.split('.').filter(s => s.trim().length > 20);
  if (sentences.length === 0) {
    throw new Error('No valid sentences found in PDF text');
  }
  const questions = [];
  for (let i = 0; i < Math.min(10, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const questionText = `What is described by: "${sentence}"?`;
    const words = sentence.split(' ').filter(w => w.length > 0);
    if (words.length === 0) continue;
    const correctAnswer = words[Math.floor(Math.random() * words.length)];
    const options = [
      correctAnswer,
      words[Math.floor(Math.random() * words.length)] || 'Option B',
      words[Math.floor(Math.random() * words.length)] || 'Option C',
      'Option D',
    ].sort(() => Math.random() - 0.5);
    const question = new Question({
      courseId: new mongoose.Types.ObjectId(courseId),
      difficulty,
      questionText,
      options,
      correctAnswer,
    });
    await question.save();
    questions.push(question);
  }
  if (questions.length === 0) {
    throw new Error('No questions generated');
  }
  return questions;
}

module.exports = router;