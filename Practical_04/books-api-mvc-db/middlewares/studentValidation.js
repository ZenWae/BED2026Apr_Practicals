const Joi = require("joi"); // Import Joi for validation

// Validation schema for students (used for POST/PUT)
const studentSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be a whole number",
    "number.min": "Age must be at least 1",
    "number.max": "Age must be realistic (120 or below)",
    "any.required": "Age is required",
  }),
  email: Joi.string().email().max(100).required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Email must be a valid email address",
    "string.max": "Email cannot exceed 100 characters",
    "any.required": "Email is required",
  }),
});

// Middleware to validate student data (for POST/PUT)
function validateStudent(req, res, next) {
  const { error } = studentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  next();
}

// Middleware to validate student ID from URL parameters
function validateStudentId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid student ID. ID must be a positive number" });
  }

  next();
}

module.exports = {
  validateStudent,
  validateStudentId,
};