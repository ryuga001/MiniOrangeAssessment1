import express from 'express';

import { login, loginWithFacebook, loginWithGoogle, register } from "../controllers/user.js";

const router = express.Router();

router.post("/login",login)
router.post("/register",register);
router.post("/login_google",loginWithGoogle);
router.post("/login_facebook",loginWithFacebook);

export { router as default };