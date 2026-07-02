// Practical 02 - Part A: Food API
// Exam cheat sheet: CRUD using in-memory array.

const express = require("express"); // Import Express.
const app = express(); // Create app.
const PORT = 3000; // Port number.

app.use(express.json()); // Enable JSON body parsing.

// Test route.
app.get("/hello", (req, res) => {
  res.send("Hello, world!"); // Simple test response.
});

let foods = []; // Store food items in memory.

// POST: create food.
app.post("/foods", (req, res) => {
  const { name, calories } = req.body; // Read input data.
  if (!name || calories == null) {
    return res.status(400).json({ message: "Cannot create food: name and calories are required." }); // 400 error.
  }
  const newFood = { id: Date.now(), name, calories }; // Create new item.
  foods.push(newFood); // Add item to array.
  res.status(201).json({ message: "Food created successfully.", food: newFood }); // 201 created.
});

// GET: read all foods or search by name.
app.get("/foods", (req, res) => {
  const { name } = req.query; // Read query parameter.
  let results = foods;
  if (name) {
    results = foods.filter((f) => f.name.includes(name)); // Filter by name.
    return res.json({ message: `Found ${results.length} food(s) matching name filter.`, foods: results });
  }
  res.json({ message: `Retrieved all foods (${results.length}).`, foods: results }); // Return all foods.
});

// PUT: update existing food.
app.put("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id); // Convert id to number.
  const { name, calories } = req.body; // Read new values.
  if (!name || calories == null) {
    return res.status(400).json({ message: "Cannot update: name and calories are required." }); // Validation.
  }
  const idx = foods.findIndex((f) => f.id === foodId); // Find matching item.
  if (idx === -1) {
    return res.status(404).json({ message: `No food found with id ${foodId}.` }); // 404 error.
  }
  foods[idx] = { id: foodId, name, calories }; // Replace old item.
  res.json({ message: `Food with id ${foodId} updated successfully.`, food: foods[idx] }); // Return updated item.
});

// DELETE: remove food by id.
app.delete("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id); // Convert id to number.
  const exists = foods.some((f) => f.id === foodId); // Check existence.
  if (!exists) {
    return res.status(404).json({ message: `No food found with id ${foodId}.` }); // 404 error.
  }
  foods = foods.filter((f) => f.id !== foodId); // Remove item from array.
  res.json({ message: `Food with id ${foodId} deleted successfully.` }); // Success message.
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // Show URL.
});