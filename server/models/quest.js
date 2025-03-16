const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  answer: { type: String, required: true },
  chapter: { type: String, required: true },
  difficulty: { type: Number, min: 1, max: 10 },
  tags: [String],
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);