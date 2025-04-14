import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or malformed' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; 
        next();
    } catch (err) {
        console.error('Authentication error:', err.message);
        res.status(401).json({ error: 'Unauthorized access' });
    }
};

export default authMiddleware;