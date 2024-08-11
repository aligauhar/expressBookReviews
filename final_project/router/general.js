const express = require('express');
let books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js"); // Correctly import `users`
const public_users = express.Router();

// Register route
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "Same" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the list of books
public_users.get('/', function (req, res) {
  res.json(books); // Return books as JSON
});

// Get book details by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = Object.values(books).filter(book => book.author === author);
  if (result.length > 0) {
    res.json(result);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get book details by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = Object.values(books).filter(book => book.title === title);
  if (result.length > 0) {
    res.json(result);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    res.json(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Reviews not found for this ISBN" });
  }
});

module.exports.general = public_users;
