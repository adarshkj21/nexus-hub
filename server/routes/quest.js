// server/routes/quest.js

const express = require('express');
const router = express.Router();
const Chapter = require('../models/quest');

// @desc    Get all chapters (or query by diversion/section)
// @route   GET /api/chapters
router.get('/', async (req, res) => {
  try {
    const chapters = await Chapter.find({});
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a specific chapter by id
// @route   GET /api/chapters/:id
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (chapter) {
      res.json(chapter);
    } else {
      res.status(404).json({ message: 'Chapter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new chapter
// @route   POST /api/chapters
router.post('/', async (req, res) => {
  try {
    // Expecting JSON data with diversion, section, and subChapters object
    const { diversion, section, subChapters } = req.body;
    const chapter = new Chapter({ diversion, section, subChapters });
    const createdChapter = await chapter.save();
    res.status(201).json(createdChapter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a chapter by id
// @route   PUT /api/chapters/:id
router.put('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (chapter) {
      chapter.diversion = req.body.diversion || chapter.diversion;
      chapter.section = req.body.section || chapter.section;
      chapter.subChapters = req.body.subChapters || chapter.subChapters;
      const updatedChapter = await chapter.save();
      res.json(updatedChapter);
    } else {
      res.status(404).json({ message: 'Chapter not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a chapter by id
// @route   DELETE /api/chapters/:id
router.delete('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (chapter) {
      await chapter.remove();
      res.json({ message: 'Chapter removed' });
    } else {
      res.status(404).json({ message: 'Chapter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
