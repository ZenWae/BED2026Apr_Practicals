// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message"); // Get reference to the message div
const apiBaseUrl = "http://localhost:3000";

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books..."; // Show loading state
    messageDiv.textContent = ""; // Clear any previous messages

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // Parse the JSON response
    const books = await response.json();

    // Clear previous content and display books
    booksListDiv.innerHTML = ""; // Clear loading message
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                `;
        booksListDiv.appendChild(bookElement);
      });
      // Add event listeners for delete buttons after they are added to the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// View book details - GET /books/:id and show it to the user
async function viewBookDetails(bookId) {
  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message || errorBody.error}`
      );
    }

    const book = await response.json();
    alert(`Book Details:\n\nID: ${book.id}\nTitle: ${book.title}\nAuthor: ${book.author}`);
  } catch (error) {
    console.error("Error fetching book details:", error);
    alert(`Failed to load book details: ${error.message}`);
  }
}

function editBook(bookId) {
  console.log("Edit book with ID:", bookId);
  window.location.href = `edit.html?id=${bookId}`;
}

// Delete a book - DELETE /books/:id
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");

  // Confirm before deleting
  const confirmed = confirm(`Are you sure you want to delete book ID ${bookId}?`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      // Success - remove the book element from the DOM
      messageDiv.textContent = `Book ID ${bookId} deleted successfully.`;
      messageDiv.style.color = "green";

      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) {
        bookElement.remove();
      }
    } else if (response.status === 404) {
      const errorBody = await response.json();
      messageDiv.textContent = `Error: ${errorBody.error || "Book not found"}`;
      messageDiv.style.color = "red";
    } else {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message || errorBody.error}`
      );
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    messageDiv.textContent = `Failed to delete book: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Fetch books when the page loads
window.addEventListener("load", fetchBooks);