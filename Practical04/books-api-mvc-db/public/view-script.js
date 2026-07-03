// ===== BOOK VIEW PAGE SCRIPT =====
// This script reads the selected book ID from the URL, fetches the matching
// record from the API, and renders the book details in a clear read-only view.
// It is used when the user wants to inspect one book without immediately
// editing or deleting it.

const loadingMessageDiv = document.getElementById("loadingMessage"); // Element that displays a loading message
const bookDetailsDiv = document.getElementById("bookDetails"); // Element that contains the book details panel
const messageDiv = document.getElementById("message"); // Element for showing error messages
const bookIdValue = document.getElementById("bookIdValue"); // Span for the book id value
const bookTitleValue = document.getElementById("bookTitleValue"); // Span for the book title value
const bookAuthorValue = document.getElementById("bookAuthorValue"); // Span for the book author value
const apiBaseUrl = "http://localhost:3000"; // Base URL for backend API requests

// Extract the book ID from the URL query string
function getBookIdFromUrl() {
  // window.location.search contains the query string from the URL
  // For example: ?id=5 or ?id=10
  const params = new URLSearchParams(window.location.search); // Parse query string from the URL
  // Get the value of the "id" parameter
  return params.get("id"); // Return the id parameter value
}

// Fetch book data from the API by book ID
async function fetchBookData(bookId) {
  try {
    // Make a GET request to fetch the book by ID
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`); // Fetch the book by id

    // Check if the response status is successful
    if (!response.ok) {
      // Parse error details from the response
      const errorBody = response.headers
        .get("content-type") // Get the content-type header
        ?.includes("application/json") // Check if it's JSON
        ? await response.json() // Parse JSON
        : { message: response.statusText }; // Use status text otherwise

      // Handle 404 (Not Found) specifically
      if (response.status === 404) {
        throw new Error("Book not found."); // Throw a specific not found error
      }

      // For other errors, create a detailed error message
      throw new Error(`HTTP error ${response.status}: ${errorBody.message}`); // Throw a general HTTP error
    }

    // If successful, parse and return the JSON response
    return await response.json(); // Return the parsed book data
  } catch (error) {
    // If any error occurs
    console.error("Error fetching book details:", error); // Log the failure
    messageDiv.textContent = `Failed to load book details: ${error.message}`; // Display error to the user
    messageDiv.style.color = "red"; // Error color
    loadingMessageDiv.style.display = "none"; // Hide loading message
    bookDetailsDiv.style.display = "none"; // Hide the details section on error
    return null; // Signal failure
  }
}

// Display book data on the page
function populateBookDetails(book) {
  // Set the text content of the span elements to display the book details
  bookIdValue.textContent = book.id; // Show the book id
  bookTitleValue.textContent = book.title; // Show the book title
  bookAuthorValue.textContent = book.author; // Show the book author
  
  // Hide the "Loading..." message since we now have the data
  loadingMessageDiv.style.display = "none"; // Hide the loading text
  // Clear any previous messages
  messageDiv.textContent = ""; // Clear any previous messages
  // Show the book details section
  bookDetailsDiv.style.display = "block"; // Display the book details section
}

// When the page loads, check if a book ID is provided in the URL
const bookIdToView = getBookIdFromUrl(); // Get book id from query string

if (!bookIdToView) {
  // If no book ID is provided
  loadingMessageDiv.style.display = "none"; // Hide loading element when no id is provided
  messageDiv.textContent = "No book ID specified in the URL."; // Inform the user about missing id
  messageDiv.style.color = "red"; // Color the message red for visibility
} else {
  // If we have a book ID, fetch and display the book
  fetchBookData(bookIdToView).then((book) => {
    // When the fetch completes
    if (book) {
      // If the book was successfully fetched
      populateBookDetails(book); // Populate the page if the book was successfully fetched
    }
    // If book is null, the error message was already shown by fetchBookData
  });
}
