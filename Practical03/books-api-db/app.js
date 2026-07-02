// Practical 03 - Books API with SQL Server
// Exam cheat sheet: database CRUD using SQL Server.

const express = require("express"); // Import Express.
const sql = require("mssql"); // Import SQL Server driver.
const dbConfig = require("./dbConfig"); // Load DB config.

const app = express(); // Create app.
const port = process.env.PORT || 3000; // Port number.

app.use(express.json()); // Parse JSON input.
app.use(express.urlencoded({ extended: false })); // Parse form input.

// Start server and connect to DB.
app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    }
    catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }

    console.log(`Server listening on port ${port}`);
});

// Gracefully close the SQL connection when the server stops.
process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");

    await sql.close();

    console.log("Database connection closed");
    process.exit(0);
});

// --- GET Routes  ---

// GET all books from the Books table.
app.get("/books", async (req, res) => {
  let connection; // Declare connection outside try for finally block
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `SELECT id, title, author FROM Books`; // Select specific columns
    const request = connection.request();
    const result = await request.query(sqlQuery);
    res.json(result.recordset); // Send the result as JSON
  } catch (error) {
    console.error("Error in GET /books:", error);
    res.status(500).send("Error retrieving books"); // Send a 500 error on failure
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// GET book by ID
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const request = connection.request();
    request.input("id", bookId); // Bind the id parameter
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Book not found");
    }
    res.json(result.recordset[0]); // Send the book data as JSON
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error);
    res.status(500).send("Error retrieving book");
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- POST Route  ---

// POST create new book
app.post("/books", async (req, res) => {
  const newBookData = req.body; // Get new book data from request body

  // **WARNING:** No validation is performed here. Invalid data may cause database errors. We will implement the necessary validation in future practicals.

  let connection;
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;`;
    const request = connection.request();
    // Bind parameters from the request body
    request.input("title", newBookData.title);
    request.input("author", newBookData.author);
    const result = await request.query(sqlQuery);

    // Attempt to fetch the newly created book to return it
    const newBookId = result.recordset[0].id;

    // Directly fetch the new book here instead of calling a function
    // Re-using the same connection before closing it in finally
    const getNewBookQuery = `SELECT id, title, author FROM Books WHERE id = @id`;
    const getNewBookRequest = connection.request();
    getNewBookRequest.input("id", newBookId);
    const newBookResult = await getNewBookRequest.query(getNewBookQuery);

    res.status(201).json(newBookResult.recordset[0]); // Send 201 Created status and the new book data
  } catch (error) {
    console.error("Error in POST /books:", error);
    // Database errors due to invalid data (e.g., missing required fields) will likely be caught here
    res.status(500).send("Error creating book");
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- PUT Route ---

// PUT update book by ID
app.put("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  const updatedBookData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      UPDATE Books
      SET title = @title, author = @author
      WHERE id = @id
    `;

    const request = connection.request();
    request.input("id", bookId);
    request.input("title", updatedBookData.title);
    request.input("author", updatedBookData.author);

    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    const getUpdatedBookQuery = `
      SELECT id, title, author FROM Books WHERE id = @id
    `;

    const getUpdatedBookRequest = connection.request();
    getUpdatedBookRequest.input("id", bookId);

    const updatedBookResult = await getUpdatedBookRequest.query(getUpdatedBookQuery);

    res.status(200).json(updatedBookResult.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /books/${bookId}:`, error);
    res.status(500).send("Error updating book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- DELETE Route ---

// DELETE book by ID
app.delete("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).send("Invalid book ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      DELETE FROM Books
      WHERE id = @id
    `;

    const request = connection.request();
    request.input("id", bookId);

    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Book not found");
    }

    res.status(204).send();
  } catch (error) {
    console.error(`Error in DELETE /books/${bookId}:`, error);
    res.status(500).send("Error deleting book");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});