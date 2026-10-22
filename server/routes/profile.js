const express = require('express');
const Profile = require('../models/Profile');
const verifyAdmin = require('../middleware/auth');

const router = express.Router();

// GET /api/profile  -> the CV document
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne().lean();
    if (!profile) {
      return res.status(404).json({ message: 'No profile found. Run "npm run seed" in /server.' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const editableFields = [
  'name', 'title', 'photo', 'objective', 'contact', 'education', 'experience',
  'skills', 'achievements', 'strengths', 'hobbies', 'languages', 'nationality',
  'heroRoles', 'heroTalkLabel', 'contactTitle', 'contactMessage'
];

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body || {}, field))
        .map((field) => [field, req.body[field]])
    );
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'No profile found.' });
    }
    return res.json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Could not update profile.', error: err.message });
  }
});

router.post('/achievements', verifyAdmin, async (req, res) => {
  try {
    if (!req.body || !req.body.title) {
      return res.status(400).json({ message: 'Achievement title is required.' });
    }
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'No profile found.' });
    profile.achievements.push({
      title: req.body.title,
      provider: req.body.provider,
      gotMark: req.body.gotMark,
      totalMark: req.body.totalMark,
      score: req.body.score,
      certificateUrl: req.body.certificateUrl
    });
    await profile.save();
    return res.status(201).json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Could not add achievement.', error: err.message });
  }
});

router.put('/achievements/:index', verifyAdmin, async (req, res) => {
  try {
    const index = Number(req.params.index);
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'No profile found.' });
    if (!Number.isInteger(index) || index < 0 || index >= profile.achievements.length) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }
    const achievement = profile.achievements[index];
    ['title', 'provider', 'gotMark', 'totalMark', 'score', 'certificateUrl'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        achievement[field] = req.body[field];
      }
    });
    await profile.save();
    return res.json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Could not update achievement.', error: err.message });
  }
});

router.delete('/achievements/:index', verifyAdmin, async (req, res) => {
  try {
    const index = Number(req.params.index);
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'No profile found.' });
    if (!Number.isInteger(index) || index < 0 || index >= profile.achievements.length) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }
    profile.achievements.splice(index, 1);
    await profile.save();
    return res.json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Could not delete achievement.', error: err.message });
  }
});

module.exports = router;
