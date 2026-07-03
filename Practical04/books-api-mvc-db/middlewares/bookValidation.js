// ===== BOOK VALIDATION MIDDLEWARE (bookValidation.js) =====
// This file protects the API by validating request data before it reaches
// the controller or database layer. Joi is used to check that incoming
// records contain the required fields and that the values match the expected
// format. This prevents invalid data from being stored and makes user-facing
// error messages clearer and more consistent.

const Joi = require("joi"); // Import Joi validation library

// Define a validation schema for book objects
// This schema specifies what fields a book should have and their requirements
const bookSchema = Joi.object({ // Define a validation schema for book objects
  // Title field requirements:
  // - Must be a string
  // - Minimum 1 character, maximum 50 characters
  // - Is required (cannot be missing)
  title: Joi.string().min(1).max(50).required().messages({ // Title must be a non-empty string
    "string.base": "Title must be a string", // Error if not a string
    "string.empty": "Title cannot be empty", // Error if empty string
    "string.min": "Title must be at least 1 character long", // Error if too short
    "string.max": "Title cannot exceed 50 characters", // Error if too long
    "any.required": "Title is required", // Error if missing
  }),
  // Author field requirements: same as title
  author: Joi.string().min(1).max(50).required().messages({ // Author must also be a non-empty string
    "string.base": "Author must be a string", // Error if not a string
    "string.empty": "Author cannot be empty", // Error if empty string
    "string.min": "Author must be at least 1 character long", // Error if too short
    "string.max": "Author cannot exceed 50 characters", // Error if too long
    "any.required": "Author is required", // Error if missing
  }),
});

// Middleware function to validate book data
// This is called before creating or updating a book
function validateBook(req, res, next) {
  // Validate the request body against our schema
  // abortEarly: false collects ALL validation errors, not just the first one
  const { error } = bookSchema.validate(req.body, { abortEarly: false }); // Validate body and collect all errors

  // If validation failed (error is not null)
  if (error) {
    // Extract error messages from each failed validation
    // Map over the details array and get just the message from each error
    const errorMessage = error.details.map((detail) => detail.message).join(", "); // Build a single error string
    // Return a 400 Bad Request response with the error messages
    return res.status(400).json({ error: errorMessage }); // Return validation failures as 400 response
  } 

  // If validation passed, continue to the next middleware/handler
  // This is how middleware chains work - next() passes control to the next function
  next(); // Continue to the next handler if validation passed
}

// Middleware function to validate book IDs
// This is called for routes that need a book ID (like /books/:id)
function validateBookId(req, res, next) {
  // Parse the id parameter from the route URL to a number
  const id = parseInt(req.params.id); // Parse id parameter from the route

  // Check if the ID is invalid:
  // isNaN(id) returns true if parsing failed (not a valid number)
  // id <= 0 returns true if the ID is 0 or negative (IDs should be positive)
  if (isNaN(id) || id <= 0) {
    // Return a 400 Bad Request response
    return res.status(400).json({ error: "Invalid book ID. ID must be a positive number" }); // Reject invalid IDs
  }

  // If the ID is valid, continue to the next middleware/handler
  next(); // Continue if the ID is valid
}

// Export the middleware functions so they can be used in other files
module.exports = {
  validateBook,
  validateBookId,
}; // Export validation middleware functions