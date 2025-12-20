require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
// Import Models for Seeding
const { User, Team, Score } = require('./models/Schemas'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/creare2026')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Connection Error:', err));

// USE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

// --- SEED ROUTE (Run this once via browser: http://localhost:5000/seed) ---
app.get('/seed', async (req, res) => {
    try {
        // 1. Clear existing data
        await Team.deleteMany({});
        await User.deleteMany({});
        await Score.deleteMany({});

        // 2. Create 17 Teams
        const teams = Array.from({ length: 17 }, (_, i) => ({
            name: `Team ${i + 1}`,
            projectTitle: `Capstone Project Title ${i + 1}`,
            description: "Research Description Placeholder"
        }));
        await Team.insertMany(teams);

        // 3. Create Users
        // Admin
        await User.create({ username: 'admin', password: 'adminpassword', role: 'admin', name: 'Main Admin' });
        
        // Judges (Create 5 for safety)
        await User.create({ username: 'judge1', password: '123', role: 'judge', name: 'Panelist 1' });
        await User.create({ username: 'judge2', password: '123', role: 'judge', name: 'Panelist 2' });
        await User.create({ username: 'judge3', password: '123', role: 'judge', name: 'Panelist 3' });

        res.send('✅ Database Seeded! You can now log in.');
    } catch (error) {
        res.status(500).send('Error seeding database: ' + error.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));