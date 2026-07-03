// ===== BOOK EDIT PAGE SCRIPT =====
// This script loads an existing book by ID, fills the edit form with the
// current values, and sends any user changes back to the API.
// The book ID comes from the page URL, which makes the page reusable for
// any record in the database rather than only a hard-coded example.

// Get references to the elements
const editBookForm = document.getElementById("editBookForm"); // The form used to edit the book
const loadingMessageDiv = document.getElementById("loadingMessage"); // Element that shows loading status
const messageDiv = document.getElementById("message"); // Element for displaying success or error messages
const bookIdInput = document.getElementById("bookId"); // Hidden input holding the current book id
const editTitleInput = document.getElementById("editTitle"); // Title input field
const editAuthorInput = document.getElementById("editAuthor"); // Author input field

const apiBaseUrl = "http://localhost:3000"; // Base URL for API requests

// Extract the book ID from the URL query string
// For example: edit.html?id=5 would extract the ID "5"
function getBookIdFromUrl() {
  // window.location.search gets the query string from the URL (everything after ?)
  // URLSearchParams is a built-in JavaScript API for parsing query strings
  const params = new URLSearchParams(window.location.search);
  // Get the value of the "id" parameter
  return params.get("id");
}

// Fetch book data from the API by book ID
// 'async' allows this function to use 'await' for asynchronous operations
async function fetchBookData(bookId) {
  try {
    // Make a GET request to fetch the book
    // The URL becomes something like: http://localhost:3000/books/5
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`); // Request book data by id

    // response.ok is true if the HTTP status is successful (200-299)
    // If false, the request failed (e.g., 404 Not Found, 500 Server Error)
    if (!response.ok) {
      // Parse the error details from the response
      const errorBody = response.headers
        .get("content-type") // Get the content-type header
        ?.includes("application/json") // Check if it's JSON
        ? await response.json() // If JSON, parse it
        : { message: response.statusText }; // Otherwise, use the status text
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      ); // Throw an error for non-ok responses
    }

    // If successful, parse and return the JSON response
    const book = await response.json(); // Parse the response JSON
    return book; // Return the book object
  } catch (error) {
    // If any error occurs (network issue, parsing error, or thrown error)
    console.error("Error fetching book data:", error); // Log the failure
    messageDiv.textContent = `Failed to load book data: ${error.message}`; // Display error message to user
    messageDiv.style.color = "red"; // Color the error message red
    loadingMessageDiv.textContent = ""; // Hide any loading text
    return null; // Signal failure by returning null
  }
}

// Fill the form fields with book data retrieved from the API
function populateForm(book) {
  // Store the book ID in the hidden input field (we'll need this ID when updating)
  bookIdInput.value = book.id; // Store book id in hidden field
  // Fill the form input fields with the current book data
  editTitleInput.value = book.title; // Populate title input
  editAuthorInput.value = book.author; // Populate author input
  // Hide the "Loading..." message since we have the data
  loadingMessageDiv.style.display = "none"; // Hide loading indicator
  // Show the edit form now that we have populated it with data
  editBookForm.style.display = "block"; // Show the form once data is ready
}

// When the page loads, check if a book ID is provided in the URL
const bookIdToEdit = getBookIdFromUrl(); // Get the book id from URL

if (bookIdToEdit) {
  // If we have a book ID, fetch the book data and populate the form
  fetchBookData(bookIdToEdit).then((book) => {
    // When the fetch completes, the book data is passed to this function
    if (book) {
      // If the book was successfully retrieved
      populateForm(book); // Populate form when book data is loaded
    } else {
      // If fetchBookData returned null (an error occurred)
      loadingMessageDiv.textContent = "Book not found or failed to load."; // Show fallback message
      messageDiv.textContent = "Could not find the book to edit."; // Inform user the book was not found
      messageDiv.style.color = "red"; // Color the message red for error state
    }
  });
} else {
  // If no book ID is in the URL, show an error message
  loadingMessageDiv.textContent = "No book ID specified for editing."; // Inform user of missing id
  messageDiv.textContent = "Please provide a book ID in the URL (e.g., edit.html?id=1)."; // Instruction for user
  messageDiv.style.color = "orange"; // Use an orange warning color
}

// Add an event listener for the form submission
// When the user clicks the Submit button, this function runs
editBookForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior (which would reload the page)
  event.preventDefault(); // Prevent default form submission behavior

  // Clear any previous messages
  messageDiv.textContent = ""; // Clear status messages
  messageDiv.style.color = ""; // Reset the message color

  // Get the updated values from the form inputs
  const bookId = bookIdInput.value; // Read book id from hidden input
  const updatedTitle = editTitleInput.value.trim(); // Read and trim title (removes whitespace)
  const updatedAuthor = editAuthorInput.value.trim(); // Read and trim author (removes whitespace)

  // Validate that we have a book ID (we need this to know which book to update)
  if (!bookId) {
    messageDiv.textContent = "Missing book ID. Cannot update the book."; // Validate book id presence
    messageDiv.style.color = "red"; // Set error color
    return; // Stop submission when invalid
  }

  // Validate that both title and author are filled in (not empty strings)
  if (!updatedTitle || !updatedAuthor) {
    messageDiv.textContent = "Title and author are required."; // Validate required fields
    messageDiv.style.color = "red"; // Set error color
    return; // Stop submission when incomplete
  }

  // Create an object with the updated book data
  const updatedBookData = {
    title: updatedTitle, // Use trimmed title
    author: updatedAuthor, // Use trimmed author
  };

  // Try to send the update request to the API
  try {
    // Send a PUT request to update the book
    // PUT is used for updates; DELETE for deletes; POST for creates
    // The URL becomes: http://localhost:3000/books/5 (where 5 is the book ID)
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "PUT", // Use PUT to update existing record
      headers: {
        "Content-Type": "application/json", // Send JSON body
      },
      body: JSON.stringify(updatedBookData), // Serialize updated book data
    });

    // Parse the response body if it's JSON
    const responseBody = response.headers
      .get("content-type") // Get the content-type header
      ?.includes("application/json") // Check if it's JSON
      ? await response.json() // Parse JSON if it is
      : { message: response.statusText }; // Otherwise use status text

    // Check if the update was successful (200 = OK/Success)
    if (response.status === 200) {
      messageDiv.textContent = "Book updated successfully."; // Show success message
      messageDiv.style.color = "green"; // Use green for success
      console.log("Updated Book:", responseBody); // Log response data
      setTimeout(() => {
        // After 1000 milliseconds (1 second), redirect to the books list
        // This gives the user time to see the success message
        window.location.href = "index.html"; // Redirect back to list after a short delay
      }, 1000);
      return; // Stop further execution
    }

    // If the request returned 400 (Bad Request), it's a validation error
    if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.error || responseBody.message}`; // Display validation error
      messageDiv.style.color = "red"; // Error color
      return; // Stop after handling validation errors
    }

    // If the request returned 404 (Not Found), the book doesn't exist
    if (response.status === 404) {
      messageDiv.textContent = "Book not found. It may have been deleted."; // Display not found message
      messageDiv.style.color = "red"; // Error color
      return; // Stop after handling not found
    }

    // For any other unsuccessful status, throw an error
    throw new Error(
      `API error! status: ${response.status}, message: ${responseBody.error || responseBody.message}`
    ); // Throw for any other unsuccessful status
  } catch (error) {
    // If any error occurs in the try block
    console.error("Error updating book:", error); // Log unexpected errors
    messageDiv.textContent = `Failed to update book: ${error.message}`; // Show error message
    messageDiv.style.color = "red"; // Use red color for errors
  }
});