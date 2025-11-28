const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Session } = require('../models');

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '7', 10);

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl,
});

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const hashRefreshToken = (token) =>
  crypto.createHmac('sha256', REFRESH_TOKEN_SECRET).update(token).digest('hex');

const issueRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString('hex');
  const refreshTokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  await Session.create({ user: userId, refreshTokenHash, expiresAt });
  return { token, expiresAt };
};

const setRefreshCookie = (res, token, expiresAt) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });
};

const getRefreshTokenFromReq = (req) => req.cookies?.refreshToken || req.body?.refreshToken || '';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: 'User with that email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash, role: 'user', status: 'active' });

    const accessToken = signAccessToken(user);
    const { token: refreshToken, expiresAt } = await issueRefreshToken(user._id);
    setRefreshCookie(res, refreshToken, expiresAt);

    return res.status(201).json({ user: sanitizeUser(user), accessToken });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const { token: refreshToken, expiresAt } = await issueRefreshToken(user._id);
    setRefreshCookie(res, refreshToken, expiresAt);

    return res.json({ user: sanitizeUser(user), accessToken });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromReq(req);
    if (refreshToken) {
      const refreshTokenHash = hashRefreshToken(refreshToken);
      await Session.findOneAndUpdate(
        { refreshTokenHash },
        { revokedAt: new Date(), revokedBy: req.user ? req.user._id : null },
      );
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
