const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Series = require('../models/Series');

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (username === adminUser && await bcrypt.compare(password, adminPass)) {
    req.session.isAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/series', isAuthenticated, async (req, res) => {
  const series = await Series.find();
  res.json(series);
});

router.post('/series/add', isAuthenticated, async (req, res) => {
  const { title, description, channels } = req.body;
  const channelArray = channels.split(',').map(ch => {
    const [name, time] = ch.split(':');
    return { name: name.trim(), time: time.trim() };
  });

  const series = new Series({ title, description, channels: channelArray });
  await series.save();
  res.json({ success: true, series });
});

router.put('/series/edit/:id', isAuthenticated, async (req, res) => {
  const { title, description, channels } = req.body;
  const channelArray = channels.split(',').map(ch => {
    const [name, time] = ch.split(':');
    return { name: name.trim(), time: time.trim() };
  });

  const updatedSeries = await Series.findByIdAndUpdate(req.params.id, { title, description, channels: channelArray }, { new: true });
  res.json({ success: true, series: updatedSeries });
});

router.delete('/series/delete/:id', isAuthenticated, async (req, res) => {
  await Series.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;