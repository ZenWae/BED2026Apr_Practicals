// ===== MAIN APPLICATION FILE (app.js) =====
// This file is the central entry point of the backend service.
// It creates the Express application, loads environment values, registers
// all API routes, serves the static front-end files, and starts the server.
// Every request that reaches this app first passes through the middleware
// configured here before it is sent to the relevant controller function.

const path = require("path"); // Import Node's path module for file path operations
const express = require("express"); // Import the Express framework for building the app
const sql = require("mssql"); // Import the Microsoft SQL Server client library
const dotenv = require("dotenv"); // Import dotenv to load environment variables

// Load environment variables from a .env file into process.env
// This allows us to store sensitive info like database credentials outside the code
dotenv.config(); // Load environment variables from a .env file into process.env

// Import controller functions that handle the business logic
const bookController = require("./controllers/bookController"); // Import book controller functions
const userController = require("./controllers/userController"); // Import user controller functions
// Import validation middleware helpers (these check if data is valid before processing)
const { validateBook, validateBookId } = require("./middlewares/bookValidation"); // Import validation middleware helpers

// Create an Express application instance
// This 'app' object will handle all HTTP requests
const app = express(); // Create an Express application instance
// Get the port from environment variables, or use 3000 if not specified
const port = process.env.PORT || 3000; // Use the PORT env variable or default to 3000

// ===== MIDDLEWARE CONFIGURATION =====
// Middleware functions that process requests before they reach the route handlers

// Enable parsing of JSON request bodies
// Without this, request.body would be undefined for JSON POST data
app.use(express.json()); // Enable JSON request body parsing
// Enable parsing of URL-encoded form data (like from HTML forms)
// extended: true allows for nested objects in the form data
app.use(express.urlencoded({ extended: true })); // Enable URL-encoded form data parsing
// Serve static files (HTML, CSS, JavaScript images) from the public directory
// This lets clients access files like index.html, style.css, etc.
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

// ===== BOOK ROUTES =====
// These routes handle all book-related API requests

// GET /books - Fetch all books
// This route gets all books from the database
app.get("/books", bookController.getAllBooks); // Define route to fetch all books
// GET /books/:id - Fetch a specific book by ID
// :id is a URL parameter (e.g., /books/5 means id=5)
// validateBookId middleware checks if the ID is valid before proceeding
app.get("/books/:id", validateBookId, bookController.getBookById); // Validate book ID, then fetch a book by id
// POST /books - Create a new book
// validateBook middleware ensures the request body has a valid title and author
app.post("/books", validateBook, bookController.createBook); // Validate book data, then create a new book
// PUT /books/:id - Update an existing book
// Both validateBookId and validateBook run before the update handler
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook); // Validate ID and data, then update a book
// DELETE /books/:id - Delete a book
// validateBookId ensures the ID is valid
app.delete("/books/:id", validateBookId, bookController.deleteBook); // Validate book ID, then delete a book

// ===== USER ROUTES =====
// These routes handle all user-related API requests

// GET /users - Fetch all users
app.get("/users", userController.getAllUsers); // Define route to fetch all users
// GET /users/search - Search for users by query parameter
// Example: /users/search?searchTerm=john
app.get("/users/search", userController.searchUsers); // Define route to search users by query parameter
// GET /users/with-books - Fetch users along with their associated books
// This is a more complex query that joins user and book data
app.get("/users/with-books", userController.getUsersWithBooks); // Define route to fetch users with their books
// GET /users/:id - Fetch a specific user by ID
app.get("/users/:id", userController.getUserById); // Define route to fetch a user by id
// POST /users - Create a new user
app.post("/users", userController.createUser); // Define route to create a new user
// PUT /users/:id - Update an existing user
app.put("/users/:id", userController.updateUser); // Define route to update an existing user
// DELETE /users/:id - Delete a user
app.delete("/users/:id", userController.deleteUser); // Define route to delete a user

// ===== START THE SERVER =====
// This starts listening for incoming HTTP requests
app.listen(port, () => {
  // This callback function runs when the server successfully starts
  console.log(`Server running on port ${port}`); // Start the server and log the listening port
});

// ===== GRACEFUL SHUTDOWN =====
// Handle the SIGINT signal (Ctrl+C) to cleanly close the database connection
process.on("SIGINT", async () => {
  // This event fires when the user presses Ctrl+C
  console.log("Server is gracefully shutting down"); // Log shutdown initiation
  // Close any open SQL Server connections
  // This prevents orphaned connections and ensures data integrity
  await sql.close(); // Close any open SQL Server connections
  console.log("Database connections closed"); // Confirm DB connections are closed
  // Exit the Node process cleanly
  process.exit(0); // Exit the Node process cleanly
});