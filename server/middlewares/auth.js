const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'No token provided or invalid format' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ msg: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }
};

module.exports = { auth };