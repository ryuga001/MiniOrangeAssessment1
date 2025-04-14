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


export const login = async (req,res) => {
    const {email, password} = req.body
    
    validateEmailAndPassword(email, password);

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    
    await User.updateOne({ _id: user._id }, { refreshToken: refreshToken  });

    return res.json({
        message : "Login successfully",
        status : 200,
        data : { accessToken, refreshToken }
    })
};


export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    const user = await User.findOne({ refreshToken: refreshToken });
    if (!user) {
        throw new Error('Refresh token not valid');
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        return accessToken;
    } catch (err) {
        throw new Error('Invalid refresh token');
    }
};


export const logout = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    await User.updateOne({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } });
};


export const register = async (req,res) => {
    const {username , email, password} = req.body
    validateEmailAndPassword(email, password);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    return res.json({ message: 'User registered successfully' ,
        success : 200 ,
        data : newUser
    })
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
            name,
            googleId,
            password: await bcrypt.hash(googleId, 10), 
        });
        await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // // Optionally prevent duplicate refresh tokens
    // if (!user.refreshToken.includes(refreshToken)) {
    //     user.refreshToken.push(refreshToken);
    //     await user.save();
    // }

    return res.json(
        {
        message : "login successfull with google",
        status : 200 ,
        data :{
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
        },
    }})
};



export const loginWithFacebook = async (req,res) => {
    const {accessToken} = req.body;
    if (!accessToken) {
        throw new Error('Facebook access token is required');
    }

    try {
        const fbRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
        );

        if (!fbRes.ok) throw new Error('Invalid Facebook token');

        const data = await fbRes.json();

        const { email, name } = data;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                password: await bcrypt.hash('default_password', 10),
            });
            await user.save();
        }

        const { accessToken: jwtAccess, refreshToken } = generateTokens(user._id);
        await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } });

        return res.json({ accessToken: jwtAccess, refreshToken });
    } catch (err) {
        throw new Error('Facebook login failed');
    }
};