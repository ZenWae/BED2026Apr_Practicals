const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Homework API");
});

app.get("/intro", (req, res) => {
  res.send("I from malaysia and I study at ngee ann polytechnic IT02 class.");
});

app.get("/name", (req, res) => {
  res.send("My name is Hun Zen Wae");
});

app.get("/hobbies", (req, res) => {
  res.send("My hobbies is playing car, modifying car and car gather with my car team members.");
});

app.get("/food", (req, res) => {
  res.send("My favourite food is mala HotPot.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});