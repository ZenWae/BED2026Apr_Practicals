// ===== USER MODEL (userModel.js) =====
// This file handles all SQL Server interactions related to users.
// It includes simple CRUD queries as well as the joined search and report
// functions used by the user management pages. Keeping the database logic
// in this model keeps the controllers focused on HTTP responses.

const sql = require("mssql"); // Import the Microsoft SQL Server client library
const dbConfig = require("../dbConfig"); // Import shared database configuration

async function getAllUsers() {
  let connection; // Declare variable used for cleanup in finally
  try {
    connection = await sql.connect(dbConfig); // Connect to the SQL Server database
    const query = "SELECT id, username, email FROM Users"; // SQL query to select all users
    const result = await connection.request().query(query); // Execute the query
    return result.recordset; // Return the rows in the result set
  } catch (error) {
    console.error("Database error:", error); // Log the error details
    throw error; // Propagate the error to the controller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the database connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log cleanup errors
      }
    }
  }
}

async function getUserById(id) {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "SELECT id, username, email FROM Users WHERE id = @id"; // SQL to fetch a single user
    const request = connection.request(); // Create a new request object
    request.input("id", id); // Bind the id parameter safely
    const result = await request.query(query); // Execute the parameterized query

    if (result.recordset.length === 0) {
      return null; // Return null when no user is found
    }

    return result.recordset[0]; // Return the first matching row
  } catch (error) {
    console.error("Database error:", error); // Log any error
    throw error; // Re-throw the error to be handled by the controller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection when done
      } catch (err) {
        console.error("Error closing connection:", err); // Log cleanup error
      }
    }
  }
}

async function createUser(userData) {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;"; // SQL to insert a new user and get the new id
    const request = connection.request(); // Create a request object
    request.input("username", userData.username); // Bind username parameter
    request.input("email", userData.email); // Bind email parameter
    const result = await request.query(query); // Execute the insert query

    const newUserId = result.recordset[0].id; // Get the generated ID from the response
    return await getUserById(newUserId); // Fetch and return the newly created user
  } catch (error) {
    console.error("Database error:", error); // Log the error
    throw error; // Propagate error to controller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the DB connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log cleanup error
      }
    }
  }
}

async function updateUser(id, userData) {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Open DB connection
    const query = "UPDATE Users SET username = @username, email = @email WHERE id = @id"; // SQL to update user fields
    const request = connection.request(); // Create request object
    request.input("username", userData.username); // Bind username parameter
    request.input("email", userData.email); // Bind email parameter
    request.input("id", id); // Bind id parameter
    const result = await request.query(query); // Execute the update

    if (result.rowsAffected[0] === 0) {
      return null; // Return null when no row was updated
    }

    return await getUserById(id); // Fetch and return the updated user
  } catch (error) {
    console.error("Database error:", error); // Log error
    throw error; // Re-throw to caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close connection cleanly
      } catch (err) {
        console.error("Error closing connection:", err); // Log cleanup failure
      }
    }
  }
}

async function deleteUser(id) {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Connect to the database
    const query = "DELETE FROM Users WHERE id = @id"; // SQL to delete a user by id
    const request = connection.request(); // Create request object
    request.input("id", id); // Bind id parameter
    const result = await request.query(query); // Execute delete query
    return result.rowsAffected[0] || 0; // Return number of deleted rows or zero
  } catch (error) {
    console.error("Database error:", error); // Log database error
    throw error; // Re-throw to caller
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err); // Log cleanup error
      }
    }
  }
}

async function searchUsers(searchTerm) {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Connect to the database

    const query = `
    SELECT *
    FROM Users
    WHERE username LIKE '%' + @searchTerm + '%'
        OR email LIKE '%' + @searchTerm + '%'
    `; // SQL query to search username and email using a parameter

    const request = connection.request(); // Create request object
    request.input("searchTerm", sql.NVarChar, searchTerm); // Bind the searchTerm parameter with explicit type
    const result = await request.query(query); // Execute the search query
    return result.recordset; // Return the matching users from the query results
  } catch (error) {
    console.error("Database error in searchUsers:", error); // Log the detailed error
    throw error; // Re-throw so controller can respond appropriately
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection after searchUsers:", err); // Log cleanup error
      }
    }
  }
}

async function getUsersWithBooks() {
  let connection; // Declare connection variable for cleanup
  try {
    connection = await sql.connect(dbConfig); // Connect to the database

    const query = `
    SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author
    FROM Users u
    LEFT JOIN UserBooks ub ON ub.user_id = u.id
    LEFT JOIN Books b ON ub.book_id = b.id
    ORDER BY u.username;
    `; // SQL query to join users with books using a left join

    const result = await connection.request().query(query); // Execute the join query

    const usersWithBooks = {}; // Prepare an object to group users and books
    for (const row of result.recordset) {
      const userId = row.user_id; // Extract user id from row
      if (!usersWithBooks[userId]) {
        usersWithBooks[userId] = {
          id: userId,
          username: row.username,
          email: row.email,
          books: [],
        }; // Initialize user object when first encountered
      }
      if (row.book_id !== null) {
        usersWithBooks[userId].books.push({
          id: row.book_id,
          title: row.title,
          author: row.author,
        }); // Add associated book to the user's book array
      }
    }

    return Object.values(usersWithBooks); // Convert grouped object into an array of users
  } catch (error) {
    console.error("Database error in getUsersWithBooks:", error); // Log any SQL or grouping error
    throw error; // Re-throw for caller error handling
  } finally {
    if (connection) {
      try {
        await connection.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection after getUsersWithBooks:", err); // Log cleanup failure
      }
    }
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersWithBooks,
}; // Export all user model functions for controllers