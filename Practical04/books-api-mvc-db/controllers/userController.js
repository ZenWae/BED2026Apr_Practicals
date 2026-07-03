// ===== USER CONTROLLER (userController.js) =====
// This controller contains the business logic for all user-related routes.
// It receives the browser request, validates the incoming parameters when
// needed, asks the model layer to perform the database work, and then sends
// the final HTTP response back to the client.
// Status codes used here: 200 for success, 201 for create, 204 for delete,
// 400 for invalid input, 404 for missing users, and 500 for server failures.
const userModel = require("../models/userModel"); 
  // Import user data access functions

  // Get all users from the database
// Handles: GET /users// Returns: 200 with array of users, or 500 on error
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers(); // Fetch all users from the model
    res.json(users); // Return user list as JSON response
  } catch (error) {
    console.error("Controller error:", error); // Log any server errors
    res.status(500).json({ error: "Error retrieving users" }); // Return a 500 error response
  }
}

async function getUserById(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id parameter from the URL
    const user = await userModel.getUserById(id); // Fetch the user record by id
    if (!user) {
      return res.status(404).json({ error: "User not found" }); // Return 404 if user was not found
    }

    res.json(user); // Return the found user as JSON
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error retrieving user" }); // Return 500 on failure
  }
}

async function createUser(req, res) {
  try {
    const newUser = await userModel.createUser(req.body); // Create a new user record from request data
      res.status(201).json(newUser); // Return the new user with HTTP 201 status
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error creating user" }); // Return 500 on failure
  }
}

async function updateUser(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id parameter from the URL
    const updatedUser = await userModel.updateUser(id, req.body); // Update the user record in the model
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" }); // Return 404 if there was no matching user
    }

    res.status(200).json(updatedUser); // Return the updated user as JSON
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error updating user" }); // Return 500 on failure
  }
}

async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id); // Parse the id parameter from the URL
    const deletedCount = await userModel.deleteUser(id); // Delete the user via the model
    if (!deletedCount) {
      return res.status(404).json({ error: "User not found" }); // Return 404 if no row was deleted
    }

    res.status(204).send(); // Return 204 No Content on successful deletion
  } catch (error) {
    console.error("Controller error:", error); // Log the error
    res.status(500).json({ error: "Error deleting user" }); // Return 500 on failure
  }
}

async function searchUsers(req, res) {
  const searchTerm = req.query.searchTerm; // Extract searchTerm from the query string
  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" }); // Return 400 if searchTerm is missing
  }

  try {
    const users = await userModel.searchUsers(searchTerm); // Search users in the model
    res.json(users); // Return matching users as JSON
  } catch (error) {
    console.error("Controller error in searchUsers:", error); // Log the error
    res.status(500).json({ message: "Error searching users with term: " + searchTerm }); // Return 500 on failure
  }
}

const User = require("../models/userModel"); // Also import user model for advanced queries

async function getUsersWithBooks(req, res) {
  try {
    const users = await User.getUsersWithBooks(); // Fetch users and their related books from the model
    res.json(users); // Return the combined user/book data as JSON
  } catch (error) {
    console.error("Controller error in getUsersWithBooks:", error); // Log the error
    res.status(500).json({ message: "Error fetching users with books" }); // Return 500 on failure
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
}; // Export all user controller functions
