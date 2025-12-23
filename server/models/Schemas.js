const mongoose = require('mongoose');

// Team Model
const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    projectTitle: { type: String, required: true },
    description: String,
    paperLink: { type: String, default: "" }
});

// User Model (Admins and Judges)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'judge'], default: 'judge' },
    name: String 
});

// Detailed scoring based on competition rubrics
const ScoreSchema = new mongoose.Schema({
    judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    
    // Best Paper Criteria (Total 100)
    paper: {
        researchQuality: { type: Number, default: 0 }, // Max 30
        innovation: { type: Number, default: 0 },      // Max 20
        impact: { type: Number, default: 0 },          // Max 20
        usability: { type: Number, default: 0 },       // Max 15
        evaluation: { type: Number, default: 0 }       // Max 15
    },

    // Best Presenter Criteria (Total 100)
    presenter: {
        clarity: { type: Number, default: 0 },         // Max 20
        mastery: { type: Number, default: 0 },         // Max 25
        panelDefense: { type: Number, default: 0 },    // Max 20
        visualAids: { type: Number, default: 0 },      // Max 15
        timeManagement: { type: Number, default: 0 },  // Max 10
        leadership: { type: Number, default: 0 },      // Max 5
        ethics: { type: Number, default: 0 }           // Max 5
    },

    // Best Poster (Total 100)
    poster: {
        design: { type: Number, default: 0 },          // Max 60
        explanation: { type: Number, default: 0 },     // Max 20
        clarity: { type: Number, default: 0 }          // Max 20
    },

    // Best Marketing (Total 100)
    marketing: {
        clarity: { type: Number, default: 0 },         // Max 25
        creativity: { type: Number, default: 0 },      // Max 25
        relevance: { type: Number, default: 0 },       // Max 20
        content: { type: Number, default: 0 },         // Max 15
        professionalism: { type: Number, default: 0 }  // Max 15
    }
}, { timestamps: true }); // Added timestamps for tracking when scores were submitted

const Team = mongoose.model('Team', TeamSchema);
const User = mongoose.model('User', UserSchema);
const Score = mongoose.model('Score', ScoreSchema);

module.exports = { Team, User, Score };