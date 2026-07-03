// ===== BOOK CREATE PAGE SCRIPT =====
// This script manages the form used to add a new book to the database.
// It reads the values entered by the user, sends them to the backend API,
// and shows a success or validation message when the request finishes.
// The browser-side code keeps the page responsive while the server performs
// the actual database insert operation.

// Get references to the form and message elements:
const createBookForm = document.getElementById("createBookForm"); // Form element for creating books
const messageDiv = document.getElementById("message"); // Element for displaying status messages
const apiBaseUrl = "http://localhost:3000"; // API base URL for requests

// Add an event listener for when the form is submitted
// 'submit' event fires when the user clicks the Submit button
// 'async' allows us to use 'await' for asynchronous API calls
createBookForm.addEventListener("submit", async (event) => {
  // Prevent the browser from submitting the form normally
  // Without this, the page would reload and we'd lose our custom processing
  event.preventDefault();

  // Clear any previous status messages
  messageDiv.textContent = "";

  // Get references to the input fields
  const titleInput = document.getElementById("title"); // Text input for book title
  const authorInput = document.getElementById("author"); // Text input for book author

  // Create an object with the book data from the form
  const newBookData = {
    title: titleInput.value, // Get the title value from the form
    author: authorInput.value, // Get the author value from the form
  };

  // Try to create the book; if something goes wrong, catch the error
  try {
    // Send a POST request to create a new book
    // 'fetch' is a JavaScript function that sends HTTP requests
    // POST means we're creating a new resource
    const response = await fetch(`${apiBaseUrl}/books`, {
      method: "POST", // POST method to create a new resource
      headers: {
        // Headers provide metadata about the request
        "Content-Type": "application/json", // Tell the server the body is JSON
      },
      // 'body' is the data we're sending to the server
      // JSON.stringify() converts our JavaScript object to a JSON string
      body: JSON.stringify(newBookData), // Convert object to JSON string
    });

    // Check if the response contains JSON data
    // Different responses might have different content types
    const responseBody = response.headers
      .get("content-type") // Get the content-type header from the response
      ?.includes("application/json") // Check if it contains "application/json"
      ? await response.json() // If JSON, parse it
      : { message: response.statusText }; // Otherwise, use the status text

    // Check if the request was successful
    // HTTP 201 means "Created" - the resource was successfully created
    if (response.status === 201) {
      // Show a success message with the new book's ID
      messageDiv.textContent = `Book created successfully! ID: ${responseBody.id}`; // Success message
      messageDiv.style.color = "green"; // Use green color for success
      createBookForm.reset(); // Reset form fields to empty
      console.log("Created Book:", responseBody); // Log the created book for debugging
    } else if (response.status === 400) {
      // HTTP 400 means "Bad Request" - validation error
      // This happens when the data doesn't meet the server's requirements
      messageDiv.textContent = `Validation Error: ${responseBody.message}`; // Show validation error message
      messageDiv.style.color = "red"; // Use red color for errors
      console.error("Validation Error:", responseBody); // Log validation details
    } else {
      // For any other error status, throw an exception
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message}`
      ); // Throw for unexpected status codes
    }
  } catch (error) {
    // This catches any errors that occurred in the try block
    // Errors could be network issues, JSON parsing errors, or thrown errors
    console.error("Error creating book:", error); // Log network or parsing errors
    messageDiv.textContent = `Failed to create book: ${error.message}`; // Show error message to user
    messageDiv.style.color = "red"; // Mark the message as an error
  }
});