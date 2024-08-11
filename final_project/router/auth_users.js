const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = []; 

// Check if username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Authenticate user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
        req.session.authorization = { accessToken };
        res.json({ accessToken });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Middleware to authenticate user
const authenticateJWT = (req, res, next) => {
    const token = req.session.authorization && req.session.authorization.accessToken;
    if (token) {
        jwt.verify(token, 'access', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Add/Modify book review
regd_users.put('/auth/review/:isbn', authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body; // Changed from req.query to req.body
    const user = req.user.username;

    if (!review) {
        return res.status(400).json({ message: 'Review is required' });
    }

    const book = books[isbn];
    if (book) {
        book.reviews[user] = review;
        res.json({ message: 'Review added/updated' });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// Delete book review
regd_users.delete('/auth/review/:isbn', authenticateJWT, (req, res) => {
    const { isbn } = req.params;
    const user = req.user.username;

    const book = books[isbn];
    if (book && book.reviews[user]) {
        delete book.reviews[user];
        res.json({ message: 'Review deleted' });
    } else {
        res.status(404).json({ message: 'Review not found or user not authorized' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
