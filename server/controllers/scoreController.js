const { Team, Score } = require('../models/Schemas');

/**
 * Fetch all teams for the Judge Dashboard list view
 */
exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        res.status(200).json(teams);
    } catch (error) {
        console.error("Fetch Teams Error:", error);
        res.status(500).json({ message: 'Error fetching teams' });
    }
};

/**
 * Submit or Update a score for a specific team
 * Uses 'upsert' to ensure only one score record exists per judge/team pair
 */
exports.submitScore = async (req, res) => {
    try {
        const { teamId, scores } = req.body;
        const judgeId = req.user.id; // Assigned by your auth middleware

        const savedScore = await Score.findOneAndUpdate(
            { judgeId, teamId },
            { 
                $set: { 
                    paper: scores.paper, 
                    presenter: scores.presenter, 
                    poster: scores.poster, 
                    marketing: scores.marketing 
                } 
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Score saved successfully', data: savedScore });
    } catch (error) {
        console.error("Submit Score Error:", error);
        res.status(500).json({ message: 'Error saving score', error: error.message });
    }
};

/**
 * Fetch all scores submitted by the currently logged-in judge
 * Useful for showing progress/completion status on the dashboard
 */
exports.getJudgeScores = async (req, res) => {
    try {
        const judgeId = req.user.id;
        // Find all scores created by this specific judge
        const scores = await Score.find({ judgeId: judgeId });
        res.status(200).json(scores);
    } catch (error) {
        console.error("Get Judge Scores Error:", error);
        res.status(500).json({ message: 'Error fetching judge scores' });
    }
};

/**
 * Fetch results for Admin dashboard
 * Populates specific fields to keep the payload lightweight
 */
exports.getResults = async (req, res) => {
    try {
        const allScores = await Score.find()
            .populate('teamId', 'name projectTitle')
            .populate('judgeId', 'name');

        res.status(200).json(allScores);
    } catch (error) {
        console.error("Get Results Error:", error);
        res.status(500).json({ message: 'Error fetching results' });
    }
};