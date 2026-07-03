// ===== BOOK MODEL (bookModel.js) =====
// This file contains the SQL Server data access logic for books.
// Each function opens a database connection, executes a specific query,
// and returns the result in a format that the controller can use.
// The model is responsible for all book-related database operations.

const sql = require("mssql"); // Import the SQL Server client library
const dbConfig = require("../dbConfig"); // Import database connection configuration

async function getAllBooks() {
  let connection; // Declare variable to hold database connection
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "SELECT id, title, author FROM Books"; // SQL to select all books
    const result = await connection.request().query(query); // Execute query
    return result.recordset; // Return the rows from the query
  } catch (error) {
    console.error("Database error:", error); // Log any database error
    throw error; // Re-throw the error to the caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log errors closing connection
      }
    }
  }
}

async function getBookById(id) {
  let connection; // Declare variable for database connection
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "SELECT id, title, author FROM Books WHERE id = @id"; // SQL to fetch a book by id
    const request = connection.request(); // Create a request object
    request.input("id", id); // Bind the id parameter
    const result = await request.query(query); // Execute the query

    if (result.recordset.length === 0) {
      return null; // Return null if the book was not found
    }

    return result.recordset[0]; // Return the first row from the result
  } catch (error) {
    console.error("Database error:", error); // Log the error
    throw error; // Re-throw so controller can handle it
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log close errors
      }
    }
  }
}

async function createBook(bookData) {
  let connection; // Declare variable for database connection
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "INSERT INTO Books (title, author) VALUES (@title, @author); SELECT SCOPE_IDENTITY() AS id;"; // SQL to insert a book and return new id
    const request = connection.request(); // Create a request object
    request.input("title", bookData.title); // Bind the title parameter
    request.input("author", bookData.author); // Bind the author parameter
    const result = await request.query(query); // Execute the insert query

    const newBookId = result.recordset[0].id; // Extract the generated ID
    return await getBookById(newBookId); // Return the created book record
  } catch (error) {
    console.error("Database error:", error); // Log any database error
    throw error; // Re-throw error to caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log errors closing connection
      }
    }
  }
}

async function updateBook(id, bookData) {
  let connection; // Declare variable for database connection
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "UPDATE Books SET title = @title, author = @author WHERE id = @id"; // SQL to update a book
    const request = connection.request(); // Create a request object
    request.input("title", bookData.title); // Bind title parameter
    request.input("author", bookData.author); // Bind author parameter
    request.input("id", id); // Bind id parameter
    const result = await request.query(query); // Execute the update query

    if (result.rowsAffected[0] === 0) {
      return null; // Return null if no row was updated
    }

    return await getBookById(id); // Return the updated book record
  } catch (error) {
    console.error("Database error:", error); // Log the error
    throw error; // Re-throw to caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log errors closing connection
      }
    }
  }
}

async function deleteBook(id) {
  let connection; // Declare variable for database connection
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "DELETE FROM Books WHERE id = @id"; // SQL to delete a book by id
    const request = connection.request(); // Create a request object
    request.input("id", id); // Bind the id parameter
    const result = await request.query(query); // Execute the delete query
    return result.rowsAffected[0] || 0; // Return number of rows deleted or 0
  } catch (error) {
    console.error("Database error:", error); // Log any database error
    throw error; // Re-throw to caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log errors closing connection
      }
    }
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
}; // Export the book model functions