// Practical 04 - Books API using MVC structure
// Exam cheat sheet: MVC pattern with controller, model, middleware.

const express = require("express"); // Import Express.
const sql = require("mssql"); // Import SQL Server.
const dotenv = require("dotenv"); // Load .env file.

dotenv.config(); // Load environment variables.

const bookController = require("./controllers/bookController"); // Import controller.
const { validateBook, validateBookId } = require("./middlewares/bookValidation"); // Import validation middleware.

const app = express(); // Create app.
const port = process.env.PORT || 3000; // Port number.

app.use(express.json()); // Parse JSON input.
app.use(express.urlencoded({ extended: true })); // Parse form input.

// Routes.
app.get("/books", bookController.getAllBooks); // Read all books.
app.get("/books/:id", validateBookId, bookController.getBookById); // Read one book by ID.
app.post("/books", validateBook, bookController.createBook); // Create one book.

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Start server.
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down"); // Shutdown message.
  await sql.close(); // Close DB connection.
  process.exit(0); // Exit app.
});