const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Extracts the Bearer token from the Authorization header and verifies it.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        
        // Attach decoded user info (id, role, etc.) to the request object
        req.user = decoded; 
        next();
    });
};

// --- Judge Dashboard Routes ---

// Get list of all teams to display on the dashboard
router.get('/teams', verifyToken, scoreController.getTeams);

// Submit a new evaluation or update an existing one (Upsert)
router.post('/submit', verifyToken, scoreController.submitScore);

// Fetch only the scores submitted by the logged-in judge
router.get('/judge-scores', verifyToken, scoreController.getJudgeScores);

// --- Admin Routes ---

// Fetch all scores from all judges for the leaderboard/results view
router.get('/results', verifyToken, scoreController.getResults);

module.exports = router;