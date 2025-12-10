// Authentication routes
const express = require('express');
const bcrypt = require('bcryptjs');
const { dbHelpers } = require('../public/db/index');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await dbHelpers.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        const existingEmail = await dbHelpers.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await dbHelpers.createUser(username, email, hashedPassword, name || username);

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ 
            success: true, 
            message: 'Registration successful',
            user: { id: user.id, username: user.username, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed. Please try again.' 
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await dbHelpers.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ 
            success: true, 
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed. Please try again.' 
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check authentication status
router.get('/status', async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await dbHelpers.getUserById(req.session.userId);
            res.json({ 
                authenticated: true, 
                user: user 
            });
        } catch (error) {
            console.error('Status check error:', error);
            res.json({ authenticated: false });
        }
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;

