const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Question CRUD Endpoints
router.post('/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/questions', async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

module.exports = router;