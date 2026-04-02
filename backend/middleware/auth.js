const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if not token
    if (!token) {
        return res.status(401).json({ error: 'No authorization token, access denied' });
    }

    try {
        // Bearer Token handle
        const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
