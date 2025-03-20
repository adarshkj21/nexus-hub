// server/models/quest.js

const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, default: "" }
});

const subChapterSchema = mongoose.Schema({
  name: { type: String, required: true },
  questions: [questionSchema]
});

const chapterSchema = mongoose.Schema({
  diversion: { type: String, required: true },  // e.g., "CAT", "BANK", "MLAI"
  section: { type: String, required: true },    // e.g., "QUANT", "LRDI", etc.
  subChapters: { type: Map, of: subChapterSchema }  // key: sub-chapter name (e.g., "percentage")
});

module.exports = mongoose.model('Chapter', chapterSchema);
