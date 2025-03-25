const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pdf: { type: Buffer, required: true },
  pdfText: { type: String, required: true },
});

module.exports = mongoose.model('Course', courseSchema);