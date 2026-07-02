// Practical 01 - Part A
// Exam cheat sheet: Express server + basic routes.

const express = require("express"); // Import Express.
const app = express(); // Create app object.
const PORT = 3000; // Local server port.

// Route for homepage.
app.get("/", (req, res) => {
  res.send("Hello from Express!"); // Send response to browser.
});

// Route for about page.
app.get("/about", (req, res) => {
  res.send("About Page"); // Simple text response.
});

// Route for contact page.
app.get("/contact", (req, res) => {
  res.send("Contact Page"); // Another simple route.
});

// Start server.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Show URL in terminal.
});

