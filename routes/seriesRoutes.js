
const express = require('express');
const router = express.Router();
const Series = require('../models/Series');

router.get('/', async (req, res) => {
  try {
    const series = await Series.find();
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const series = await Series.find({ title: { $regex: q, $options: 'i' } });
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ error: 'Series not found' });
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;