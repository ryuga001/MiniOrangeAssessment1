import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import User from "../models/user.js";
import dotenv  from "dotenv";

dotenv.config();

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("Environment variables ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are required");
}


const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET);
    return { accessToken, refreshToken };
};


const validateEmailAndPassword = (email, password) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        validateEmailAndPassword(email, password);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials', success: false });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true ,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({
            message: "Login successfully",
            success: true,
            data: { accessToken}
        });
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required', success: false });
        }

        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(404).json({ message: 'Invalid refresh token', success: false });
        }

        try {
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const accessToken = jwt.sign({ id: decoded.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            return res.json({ message: 'Access token refreshed', success: true, data: { accessToken } });
        } catch (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ message: 'Invalid refresh token', success: false });
        }
    } catch (error) {
        console.error('Refresh token error:', error.message);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};


export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies ;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required', success: false });
        }

        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            return res.status(404).json({ message: 'Invalid refresh token', success: false });
        }

        await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: refreshToken } });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        return res.json({ message: 'Logout successful', success: true });
    } catch (error) {
        console.error('Logout error:', error.message);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};


export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        validateEmailAndPassword(email, password);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();

        const { accessToken, refreshToken } = generateTokens(newUser._id);

        await User.updateOne({ _id: newUser._id }, { $push: { refreshTokens: refreshToken } });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(201).json({
            message: 'User registered successfully',
            success: true,
            data: {
                accessToken,
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
            },
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};

export const loginWithGoogle = async (req,res) => {
    const {googleToken} = req.body;
    if (!googleToken) {
        throw new Error('Google token is required');
    }

    let googleUser;
    try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        if (!response.ok) {
            throw new Error('Invalid Google token');
        }
        googleUser = await response.json();
    } catch (err) {
        console.error('Google token verification failed:', err.message);
        throw new Error('Failed to verify Google token');
    }

    const { email, name, sub: googleId } = googleUser;

    if (!email || !googleId) {
        throw new Error('Invalid token payload: missing email or ID');
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            email,
            username : name,
            password: await bcrypt.hash(googleId, 10), 
        });
        await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);


    if (!user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens.push(refreshToken);
        await user.save();
    }
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true ,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    return res.json(
        {
        message : "login successfull with google",
        success : true ,
        data :{
            accessToken : accessToken,
            user : user
        },
    })
};



export const loginWithFacebook = async (req, res) => {
    const { facebookToken } = req.body;
    if (!facebookToken) {
        throw new Error('Facebook token is required');
    }

    let facebookUser;
    try {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${facebookToken}`);
        if (!response.ok) {
            throw new Error('Invalid Facebook token');
        }
        facebookUser = await response.json();
    } catch (err) {
        console.error('Facebook token verification failed:', err.message);
        throw new Error('Failed to verify Facebook token');
    }

    const { id: facebookId, email, name } = facebookUser;

    if (!email || !facebookId) {
        throw new Error('Invalid token payload: missing email or ID');
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = new User({
            email,
            username: name,
            password: await bcrypt.hash(facebookId, 10), 
        });
        await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    if (!user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens.push(refreshToken);
        await user.save();
    }

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
        message: 'Login successful with Facebook',
        success: true,
        data: {
            accessToken: accessToken,
            user: user,
        },
    });
};