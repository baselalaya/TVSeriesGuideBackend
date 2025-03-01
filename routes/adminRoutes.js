const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Series = require('../models/Series');

const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) return next();
  res.redirect('/admin/login');
};

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;
    console.log('Username entered:', username);
    console.log('Password entered:', password);
    console.log('ADMIN_USER:', adminUser);
    console.log('ADMIN_PASS:', adminPass);
    console.log('Password match:', await bcrypt.compare(password, adminPass));
  
    if (username === adminUser && await bcrypt.compare(password, adminPass)) {
      req.session.isAuthenticated = true;
      res.redirect('/admin/dashboard');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });

router.get('/dashboard', isAuthenticated, async (req, res) => {
  const series = await Series.find();
  res.render('dashboard', { series });
});

router.get('/add', isAuthenticated, (req, res) => {
  res.render('addSeries');
});

router.post('/add', isAuthenticated, async (req, res) => {
  const { title, description, channels } = req.body;
  const channelArray = channels.split(',').map(ch => {
    const [name, time] = ch.split(':');
    return { name: name.trim(), time: time.trim() };
  });

  const series = new Series({ title, description, channels: channelArray });
  await series.save();
  res.redirect('/admin/dashboard');
});

router.get('/edit/:id', isAuthenticated, async (req, res) => {
  const series = await Series.findById(req.params.id);
  res.render('editSeries', { series });
});

router.post('/edit/:id', isAuthenticated, async (req, res) => {
  const { title, description, channels } = req.body;
  const channelArray = channels.split(',').map(ch => {
    const [name, time] = ch.split(':');
    return { name: name.trim(), time: time.trim() };
  });

  await Series.findByIdAndUpdate(req.params.id, { title, description, channels: channelArray });
  res.redirect('/admin/dashboard');
});

router.post('/delete/:id', isAuthenticated, async (req, res) => {
  await Series.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

module.exports = router;