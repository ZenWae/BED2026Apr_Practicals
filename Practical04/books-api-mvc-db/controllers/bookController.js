// ===== BOOK CONTROLLER (bookController.js) =====
// This controller manages HTTP requests that involve books.
// It receives the Express request and response objects, calls the model,
// and returns JSON responses in the format expected by the front-end pages.
// The main responsibility of this file is to translate database results into
// user-friendly API responses and handle errors consistently.

const bookModel = require("../models/bookModel"); // Import book data access functions

async function getAllBooks(req, res) {
  try {
    const books = await bookModel.getAllBooks(); // Fetch all books from the model
    res.json(books); // Send the book list as JSON response
  } catch (error) {
    console.error("Controller error:", error); // Log the error to the console
    res.status(500).json({ error: "Error retrieving books" }); // Return a 500 response on failure
  }
}

async function getBookById(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id URL parameter to an integer
    const book = await bookModel.getBookById(id); // Fetch the book from the model
    if (!book) {
      return res.status(404).json({ error: "Book not found" }); // Return 404 if no book exists
    }

    res.json(book); // Return the found book as JSON
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error retrieving book" }); // Return a 500 response on error
  }
}

async function createBook(req, res) {
  try {
    const newBook = await bookModel.createBook(req.body); // Create a new book using request body data
    res.status(201).json(newBook); // Return the created book with HTTP 201 status
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error creating book" }); // Return 500 on failure
  }
}

async function updateBook(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id parameter to an integer
    const updatedBook = await bookModel.updateBook(id, req.body); // Update the book record in the model
    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" }); // Return 404 if update did not find the book
    }

    res.status(200).json(updatedBook); // Return the updated book as JSON
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error updating book" }); // Return 500 on failure
  }
}

async function deleteBook(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id parameter to an integer
    const deletedCount = await bookModel.deleteBook(id); // Delete the book via the model
    if (!deletedCount) {
      return res.status(404).json({ error: "Book not found" }); // If no rows deleted, return 404
    }

    res.status(204).send(); // Return 204 No Content on successful delete
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error deleting book" }); // Return 500 on failure
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
}; // Export book controller functions
