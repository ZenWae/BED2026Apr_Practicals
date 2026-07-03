// ===== USERS LIST PAGE SCRIPT =====
// This file powers the main user management page in the front end.
// It loads the users from the API, supports search and filtering, and links
// the view, edit, and delete controls to the corresponding actions. It also
// includes the advanced join-based report that shows each user with the books
// associated with that account.

// Get references to all the DOM elements we'll interact with
const usersListDiv = document.getElementById("usersList"); // Container for displaying the user list
const fetchUsersBtn = document.getElementById("fetchUsersBtn"); // Button to load all users
const fetchUsersWithBooksBtn = document.getElementById("fetchUsersWithBooksBtn"); // Button to load users with their books
const searchUserForm = document.getElementById("searchUserForm"); // Form for searching users
const searchTermInput = document.getElementById("searchTerm"); // Input field for search term
const clearSearchBtn = document.getElementById("clearSearchBtn"); // Button to clear search results
const messageDiv = document.getElementById("message"); // Div for showing messages (success/error)
const apiBaseUrl = "http://localhost:3000"; // Base URL for all API requests

// Fetch and display users from the API
// The optional searchTerm parameter is used to search for specific users
async function fetchUsers(searchTerm = null) {
  try {
    // Show a loading message while we fetch data
    usersListDiv.innerHTML = "Loading users...";
    // Clear any previous messages
    messageDiv.textContent = "";

    // Build the URL based on whether we're searching or getting all users
    // If searchTerm is provided, search for users; otherwise, get all users
    const url = searchTerm
      ? `${apiBaseUrl}/users/search?searchTerm=${encodeURIComponent(searchTerm)}` // URL for search
      : `${apiBaseUrl}/users`; // URL for all users
    // encodeURIComponent() converts spaces and special characters to %20, %2F, etc.

    // Fetch the users from the API
    const response = await fetch(url);
    
    // Check if the response is successful
    if (!response.ok) {
      // Parse error details from the response
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(`HTTP ${response.status}: ${errorBody.error || errorBody.message}`);
    }

    // Parse the JSON response into an array of users
    const users = await response.json();
    
    // If no users were found, show a message
    if (users.length === 0) {
      usersListDiv.innerHTML = "<p>No users found.</p>";
      return; // Exit the function early
    }

    // Clear the loading message
    usersListDiv.innerHTML = "";
    
    // Loop through each user and create an HTML element to display it
    users.forEach((user) => {
      // Create a new div element for each user
      const userElement = document.createElement("div");
      // Add a CSS class for styling
      userElement.classList.add("user-item");
      // Set the HTML content for the user element with user data and action buttons
      userElement.innerHTML = `
        <h3>${user.username}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <button onclick="viewUser(${user.id})">View</button>
        <button onclick="editUser(${user.id})">Edit</button>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
      `;
      // Add the user element to the page
      usersListDiv.appendChild(userElement);
    });

    // Attach delete click handlers to all delete buttons
    // querySelectorAll returns all matching elements
    document.querySelectorAll(".delete-btn").forEach((button) => {
      // For each delete button, add a click event listener
      button.addEventListener("click", handleDeleteClick);
    });
  } catch (error) {
    // If an error occurs, log it and display it to the user
    console.error("Error loading users:", error); // Log for debugging
    // Show the error message in red
    usersListDiv.innerHTML = `<p style="color: red;">Failed to load users: ${error.message}</p>`;
  }
}

// Fetch users and their associated books from the API
// This is a more complex query that joins user and book data
async function fetchUsersWithBooks() {
  try {
    // Show a loading message
    usersListDiv.innerHTML = "Loading users with books...";
    messageDiv.textContent = "";

    // Fetch users with their books (this endpoint joins User and Book data)
    const response = await fetch(`${apiBaseUrl}/users/with-books`);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(`HTTP ${response.status}: ${errorBody.error || errorBody.message}`);
    }

    // Parse the JSON response
    const users = await response.json();
    
    // If no data was returned, show a message
    if (users.length === 0) {
      usersListDiv.innerHTML = "<p>No users or book relationships found.</p>";
      return;
    }

    // Clear the loading message
    usersListDiv.innerHTML = "";
    
    // Create an HTML element for each user
    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user-item");
      
      // Create HTML for the user's books
      // If the user has books, create a list of them; otherwise, show "No books assigned"
      const booksHtml = user.books.length
        ? `<div class="user-books"><strong>Books:</strong><ul>${user.books
            // Map over each book and create a list item
            .map((book) => `<li>${book.title} by ${book.author} (ID: ${book.id})</li>`)
            // Join the array items into a single string
            .join("")}</ul></div>`
        : "<div class=\"user-books\">No books assigned.</div>"; // If no books, show this message

      // Build the complete HTML for the user card
      userElement.innerHTML = `
        <h3>${user.username}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <button onclick="viewUser(${user.id})">View</button>
        <button onclick="editUser(${user.id})">Edit</button>
        <button class="delete-btn" data-id="${user.id}">Delete</button>
        ${booksHtml}
      `;
      // Add the user element to the page
      usersListDiv.appendChild(userElement);
    });

    // Attach delete click handlers to all delete buttons
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteClick);
    });
  } catch (error) {
    // If an error occurs, log it and display it
    console.error("Error loading users with books:", error);
    usersListDiv.innerHTML = `<p style="color: red;">Failed to load users with books: ${error.message}</p>`;
  }
}

// Navigate to the user view page for a specific user
function viewUser(userId) {
  // window.location.href changes the URL and loads the new page
  // This passes the user ID as a query parameter: user-view.html?id=5
  window.location.href = `user-view.html?id=${userId}`;
}

// Navigate to the user edit page for a specific user
function editUser(userId) {
  // Similar to viewUser, but goes to the edit page with the user ID
  window.location.href = `user-edit.html?id=${userId}`;
}

// Handle the delete button click event
async function handleDeleteClick(event) {
  // Get the user ID from the button's data-id attribute
  const userId = event.target.getAttribute("data-id");
  
  // Validate that we have a user ID
  if (!userId) {
    messageDiv.textContent = "Missing user ID for deletion.";
    return; // Exit early if no ID
  }

  try {
    // Send a DELETE request to the API
    // DELETE means we're removing a resource
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "DELETE", // HTTP method for deleting
    });

    // Check if the deletion was successful (204 = No Content - successful delete)
    if (response.status === 204) {
      // Find the parent user-item element
      // closest() searches up the DOM tree to find a matching element
      const userElement = event.target.closest(".user-item");
      // If we found the element, remove it from the page
      if (userElement) {
        userElement.remove(); // Remove the element from the DOM
      }
      // Show a success message
      messageDiv.textContent = `User ${userId} deleted successfully.`;
      messageDiv.style.color = "green"; // Color it green for success
      return; // Exit the function
    }

    // If the delete failed, parse the error response
    const errorBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    // Show the error message to the user
    messageDiv.textContent = `Failed to delete user: ${errorBody.error || errorBody.message}`;
    messageDiv.style.color = "red"; // Color it red for error
  } catch (error) {
    // If a network error or other exception occurs
    console.error("Error deleting user:", error);
    messageDiv.textContent = `Error deleting user: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

searchUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const term = searchTermInput.value.trim();
  if (term === "") {
    messageDiv.textContent = "Please enter a search term.";
    messageDiv.style.color = "orange";
    return;
  }
  fetchUsers(term);
});

clearSearchBtn.addEventListener("click", () => {
  searchTermInput.value = "";
  messageDiv.textContent = "";
  fetchUsers();
});

fetchUsersBtn.addEventListener("click", () => fetchUsers());
fetchUsersWithBooksBtn.addEventListener("click", () => fetchUsersWithBooks());
window.addEventListener("load", () => fetchUsers());
