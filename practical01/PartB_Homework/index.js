// Practical 01 - Part B
// Exam cheat sheet: multiple routes in one Express API.

const express = require("express"); // Import Express.
const app = express(); // Create app.
const PORT = 3000; // Port number.

// Root route.
app.get("/", (req, res) => {
  res.send("Welcome to Homework API"); // Send homepage message.
});

// Introduction route.
app.get("/intro", (req, res) => {
  res.send("I from malaysia and I study at ngee ann polytechnic IT02 class."); // Personal intro text.
});

// Name route.
app.get("/name", (req, res) => {
  res.send("My name is Hun Zen Wae"); // Return name.
});

// Hobbies route.
app.get("/hobbies", (req, res) => {
  res.send("My hobbies is playing car, modifying car and car gather with my car team members."); // Return hobbies.
});

// Food route.
app.get("/food", (req, res) => {
  res.send("My favourite food is mala HotPot."); // Return favorite food.
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Show URL.
});