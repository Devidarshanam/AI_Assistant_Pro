const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Score = require('../models/Score');

// POST /api/scores/save
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { fileName, score } = req.body;
        
        if (!fileName || !score) {
            return res.status(400).json({ error: 'File name and score are required' });
        }

        const newScore = new Score({
            userId: req.user.id,
            fileName: fileName,
            score: score
        });

        const savedScore = await newScore.save();
        res.json(savedScore);
    } catch (err) {
        console.error('Error saving score:', err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/scores/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        // Fetch all scores for the logged in user, sorted by newest first
        const scores = await Score.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(scores);
    } catch (err) {
        console.error('Error fetching score history:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
