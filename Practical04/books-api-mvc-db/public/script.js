// ===== BOOKS LIST PAGE SCRIPT =====
// This file powers the books overview page in the front end.
// It fetches the current books from the API, renders them as interactive
// cards, and wires the view, edit, and delete buttons to the matching
// actions so the user can manage the collection without reloading the page.

// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList"); // Container for the book list
const fetchBooksBtn = document.getElementById("fetchBooksBtn"); // Button to refresh books
const messageDiv = document.getElementById("message"); // Div for status messages
const apiBaseUrl = "http://localhost:3000"; // Base URL for API requests

// Fetch all books from the API and display them
async function fetchBooks() {
  try {
    // Display a loading message while fetching
    booksListDiv.innerHTML = "Loading books..."; // Show a loading indicator
    messageDiv.textContent = ""; // Clear previous messages

    // Make a GET request to fetch all books
    const response = await fetch(`${apiBaseUrl}/books`); // Send GET request to /books

    // Check if the response is successful
    if (!response.ok) {
      // Parse error details from the response
      const errorBody = response.headers
        .get("content-type") // Get the content-type header
        ?.includes("application/json") // Check if it's JSON
        ? await response.json() // Parse JSON
        : { message: response.statusText }; // Use status text otherwise
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      ); // Throw error for non-ok status
    }

    // Parse the response JSON into an array of books
    const books = await response.json(); // Parse the response JSON

    // Clear the loading message
    booksListDiv.innerHTML = ""; // Clear the loading state
    
    // If no books exist, show a message
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>"; // Show no books message
    } else {
      // Loop through each book and create an HTML element to display it
      books.forEach((book) => {
        // Create a new div element for this book
        const bookElement = document.createElement("div"); // Create a container element
        // Add a CSS class for styling
        bookElement.classList.add("book-item"); // Add styling class
        // Store the book ID in a data attribute for later reference
        bookElement.setAttribute("data-book-id", book.id); // Store the book id in a data attribute
        // Build the HTML content with book details and action buttons
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                `; // Insert book details and buttons
        // Add this book element to the page
        booksListDiv.appendChild(bookElement); // Add the book element to the page
      });
      // Attach click handlers to all delete buttons
      // querySelectorAll returns a collection of all matching elements
      document.querySelectorAll(".delete-btn").forEach((button) => {
        // For each delete button, add an event listener
        button.addEventListener("click", handleDeleteClick); // Attach delete handler to each delete button
      });
    }
  } catch (error) {
    // If any error occurs
    console.error("Error fetching books:", error); // Log any fetch error
    // Display the error message to the user in red
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`; // Display error message
  }
}

// Navigate to the book details view page
function viewBookDetails(bookId) {
  // window.location.href changes the URL and loads the new page
  // This passes the book ID as a query parameter: view.html?id=5
  console.log("View details for book ID:", bookId); // Log the selected book ID
  window.location.href = `view.html?id=${bookId}`; // Redirect to the view page for that book
}

// Navigate to the book edit page
function editBook(bookId) {
  // Similar to viewBookDetails, but goes to the edit page with the book ID
  console.log("Edit book with ID:", bookId); // Log the selected book ID
  window.location.href = `edit.html?id=${bookId}`; // Redirect to the edit page for that book
}

// Handle the delete button click event
async function handleDeleteClick(event) {
  // Get the book ID from the clicked button's data-id attribute
  const bookId = event.target.getAttribute("data-id"); // Read the book id from the clicked button
  console.log("Attempting to delete book with ID:", bookId); // Log the delete attempt
  messageDiv.textContent = ""; // Clear status messages

  // Validate that we have a book ID
  if (!bookId) {
    messageDiv.textContent = "Unable to delete book: missing book ID."; // Show missing id error
    return; // Stop execution if no book id is present
  }

  try {
    // Send a DELETE request to remove the book from the database
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE", // Send DELETE request to API
    });

    // Check if the deletion was successful (204 = No Content - successful delete)
    if (response.status === 204) {
      // Find the parent book-item element
      // closest() searches up the DOM tree to find a matching element
      const bookElement = event.target.closest(".book-item"); // Find the parent book container
      // If we found the element, remove it from the page
      if (bookElement) {
        bookElement.remove(); // Remove the book from the DOM
      }
      // Show a success message
      messageDiv.textContent = `Book ${bookId} deleted successfully.`; // Show success message
      return; // Exit after success
    }

    // If the delete failed, parse the error response
    const errorBody = response.headers
      .get("content-type") // Get the content-type header
      ?.includes("application/json") // Check if it's JSON
      ? await response.json() // Parse JSON
      : null; // Otherwise, null
    // Determine the error message to display
    const errorMessage = errorBody?.error || response.statusText || "Unknown error"; // Determine error message

    // Handle 404 (Not Found) specifically
    if (response.status === 404) {
      messageDiv.textContent = "Book not found. It may already have been deleted."; // Specific 404 message
    } else {
      messageDiv.textContent = `Failed to delete book: ${errorMessage}`; // Generic failure message
    }
  } catch (error) {
    console.error("Error deleting book:", error); // Log unexpected errors
    messageDiv.textContent = `Error deleting book: ${error.message}`; // Show error message to user
  }
}

fetchBooksBtn.addEventListener("click", fetchBooks); // Refresh book list when button is clicked
window.addEventListener('load', fetchBooks); // Load books automatically when page loads