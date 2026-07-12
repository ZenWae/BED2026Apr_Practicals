const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
// Load environment variables
dotenv.config();


const bookController = require("./controllers/bookController");
const {
  validateBook,
  validateBookId,
} = require("./middlewares/bookValidation"); // import Book Validation Middleware

const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---

app.use(express.static(path.join(__dirname, "public")));

// Routes for books
// Apply middleware *before* the controller function for routes that need it
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById); // Use validateBookId middleware
app.post("/books", validateBook, bookController.createBook); // Use validateBook middleware
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);
// Add routes for PUT/DELETE if implemented, applying appropriate middleware

// Routes for users
app.get("/users/search", userController.searchUsers);
app.get("/users/with-books", userController.getUsersWithBooks);
app.post("/users", validateUser, userController.createUser);
app.get("/users", userController.getAllUsers);
app.get("/users/:id", validateUserId, userController.getUserById);
app.put("/users/:id", validateUserId, validateUser, userController.updateUser);
app.delete("/users/:id", validateUserId, userController.deleteUser);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});

