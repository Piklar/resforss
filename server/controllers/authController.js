const jwt = require('jsonwebtoken');
const { User } = require('../models/Schemas');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // In a real app, use bcrypt.compare(password, user.password)
        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            token,
            user: {
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};