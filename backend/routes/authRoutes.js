const express = require('express');
const passport = require('passport');
const authService = require('../services/authService');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authmiddleware');
const router = express.Router();


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: yourSecurePassword123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */

router.post('/register', async (req, res) => {
  try {
    const token = await authService.register(req.body);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post('/login', async (req, res) => {
  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google login
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT
 */
// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = authService.generateToken(req.user);
    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  }
);


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: New access and refresh tokens issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing refresh token
 *       401:
 *         description: Invalid or expired token
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });

  try {
    const tokens = await authService.refreshTokens(refreshToken);
    res.json({ message: 'Token refreshed', ...tokens });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (handles both JWT and session)
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Invalid logout request
 *       500:
 *         description: Logout failed
 */
router.post('/logout', async (req, res) => {
  // 1. JWT-based logout
  if (req.body.userId && req.body.refreshToken) {
    try {
      await authService.logout(req.body.userId, req.body.refreshToken);
      return res.json({ message: 'Logged out successfully (JWT)' });
    } catch (err) {
      return res.status(500).json({ message: 'JWT logout failed', error: err.message });
    }
  }

  // 2. Session-based logout (OAuth via Passport)
  if (typeof req.logout === 'function') {
    req.logout(err => {
      if (err) return res.status(500).json({ message: 'Session logout failed', error: err.message });

      if (req.session) {
        req.session.destroy(err => {
          if (err) return res.status(500).json({ message: 'Session destroy failed', error: err.message });
          res.clearCookie('connect.sid'); // default cookie name for express-session
          return res.json({ message: 'Logged out successfully (Session)' });
        });
      } else {
        return res.json({ message: 'Logged out successfully (No session)' });
      }
    });
  } else {
    return res.status(400).json({ message: 'No valid logout method detected' });
  }
});


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send reset password email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */
// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password has been reset
 */
// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile (name and avatar image)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     avatarUrl:
 *                       type: string
 *       401:
 *         description: Unauthorized or missing token
 *       500:
 *         description: Server error during update
 */

router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'),
  async (req, res) => {
    try {
      const user = req.user;
      const { name } = req.body;

      if (name) user.name = name;
      if (req.file) {
        user.avatarUrl = `/uploads/${req.file.filename}`;
      }

      await user.save();
      res.json({
        message: 'Profile updated successfully',
        user: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



module.exports = router;
