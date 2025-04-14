import express from "express"
import authMiddleware from "../middlewares/auth.js";
import { getProfile, updateProfile } from "../controllers/user.js";
const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;