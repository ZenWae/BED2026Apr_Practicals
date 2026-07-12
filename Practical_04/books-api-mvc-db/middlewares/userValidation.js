const Joi = require("joi");

// Validation schema for users (used for POST/PUT)
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.alphanum": "Username must only contain letters and numbers",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 50 characters",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().max(100).required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be a valid email address",
    "string.max": "Email cannot exceed 100 characters",
    "any.required": "Email is required",
  }),
});

// Middleware to validate user data (for POST/PUT)
function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate user ID from URL parameters
function validateUserId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid user ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateUser,
  validateUserId,
};