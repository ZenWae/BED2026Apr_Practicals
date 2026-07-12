// Get references to the elements
const editBookForm = document.getElementById("editBookForm");
const loadingMessageDiv = document.getElementById("loadingMessage"); // Element to show loading state
const messageDiv = document.getElementById("message"); // Element to display messages (success/error)
const bookIdInput = document.getElementById("bookId"); // Hidden input to store the book ID
const editTitleInput = document.getElementById("editTitle"); // Input for the book title
const editAuthorInput = document.getElementById("editAuthor"); // Input for the book author

// Base URL for the API.
const apiBaseUrl = "http://localhost:3000";

// Function to get book ID from URL query parameter (e.g., edit.html?id=1)
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search); // Get URL query parameters
  return params.get("id"); // Return the value of the 'id' parameter
}

// Function to fetch existing book data from the API based on ID
async function fetchBookData(bookId) {
  try {
    // Make a GET request to the API endpoint for a specific book
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    // Check if the HTTP response status is not OK (e.g., 404, 500)
    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.error || errorBody.message}`
      );
    }

    // Parse the JSON response body into a JavaScript object
    const book = await response.json();
    return book; // Return the fetched book object
  } catch (error) {
    console.error("Error fetching book data:", error);
    messageDiv.textContent = `Failed to load book data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = ""; // Hide loading message if it was shown
    return null; // Indicate that fetching failed
  }
}

// Function to populate the form fields with the fetched book data
function populateForm(book) {
  bookIdInput.value = book.id; // Store the book ID in the hidden input
  editTitleInput.value = book.title; // Set the title input value
  editAuthorInput.value = book.author; // Set the author input value
  loadingMessageDiv.style.display = "none"; // Hide the loading message
  editBookForm.classList.remove("hidden"); // Show the edit form
}

// --- Code to run when the page loads ---

// Get the book ID from the URL when the page loads
const bookIdToEdit = getBookIdFromUrl();

// Check if a book ID was found in the URL
if (bookIdToEdit) {
  fetchBookData(bookIdToEdit).then((book) => {
    if (book) {
      populateForm(book);
    } else {
      loadingMessageDiv.textContent = "Book not found or failed to load.";
      messageDiv.textContent = "Could not find the book to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  loadingMessageDiv.textContent = "No book ID specified for editing.";
  messageDiv.textContent =
    "Please provide a book ID in the URL (e.g., edit.html?id=1).";
  messageDiv.style.color = "orange";
}

// Handle form submission - PUT /books/:id
editBookForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default browser form submission

  messageDiv.textContent = ""; // Clear previous messages

  // Collect updated data from the form
  const bookId = bookIdInput.value;
  const updatedBookData = {
    title: editTitleInput.value,
    author: editAuthorInput.value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBookData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      messageDiv.textContent = "Book updated successfully!";
      messageDiv.style.color = "green";
      console.log("Updated Book:", responseBody);

      // Redirect back to the list after a short pause
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.error || responseBody.message}`;
      messageDiv.style.color = "red";
    } else if (response.status === 404) {
      messageDiv.textContent = `Error: ${responseBody.error || "Book not found"}`;
      messageDiv.style.color = "red";
    } else {
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.error || responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error updating book:", error);
    messageDiv.textContent = `Failed to update book: ${error.message}`;
    messageDiv.style.color = "red";
  }
});