// ===== USER EDIT PAGE SCRIPT =====
// This script loads a single user record from the API, places the values
// into the edit form, and sends the updated information back to the server.
// The page is intentionally built around the user ID in the URL so the same
// interface can update any stored user record in the database.

// Get references to DOM elements used throughout this page
const editUserForm = document.getElementById("editUserForm"); // The form for editing user details
const loadingMessageDiv = document.getElementById("loadingMessage"); // Shows "Loading..." text while fetching data
const messageDiv = document.getElementById("message"); // Shows success/error messages
const userIdInput = document.getElementById("userId"); // Hidden input that stores the user ID
const editUsernameInput = document.getElementById("editUsername"); // Text input for the username
const editEmailInput = document.getElementById("editEmail"); // Text input for the email
const apiBaseUrl = "http://localhost:3000"; // Base URL for API requests

// Extract the user ID from the URL query string
// For example: user-edit.html?id=5 would extract "5"
function getUserIdFromUrl() {
  // window.location.search gets the query string part of the URL (the ? and everything after)
  // URLSearchParams is a built-in JavaScript object for parsing query strings
  const params = new URLSearchParams(window.location.search);
  // Get the value of the "id" parameter from the query string
  return params.get("id");
}

// Fetch user data from the API by user ID
// 'async' allows this function to use 'await' for asynchronous operations
async function fetchUserData(userId) {
  // Try to fetch the data; if something goes wrong, the catch block will handle it
  try {
    // Make a GET request to fetch the user data
    // The URL becomes something like: http://localhost:3000/users/5
    const response = await fetch(`${apiBaseUrl}/users/${userId}`);
    
    // response.ok is true if the status code is in the 200-299 range (successful)
    // If it's false, the request failed (e.g., 404 Not Found, 500 Server Error)
    if (!response.ok) {
      // Parse the error details from the response
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      // Throw an error with details about what went wrong
      throw new Error(`HTTP ${response.status}: ${errorBody.error || errorBody.message}`);
    }

    // If successful, parse and return the JSON response
    return await response.json();
  } catch (error) {
    // If any error occurs (network issue, JSON parsing error, or thrown error)
    console.error("Error fetching user data:", error); // Log the error for debugging
    loadingMessageDiv.textContent = ""; // Hide the loading message
    messageDiv.textContent = `Failed to load user data: ${error.message}`; // Show error message
    messageDiv.style.color = "red"; // Color it red to indicate error
    return null; // Return null to indicate failure
  }
}

// Fill the form fields with user data retrieved from the API
function populateForm(user) {
  // Store the user ID in the hidden input (we'll need it when updating)
  userIdInput.value = user.id;
  // Fill the form inputs with the current user data
  editUsernameInput.value = user.username;
  editEmailInput.value = user.email;
  // Hide the "Loading..." message since data has loaded
  loadingMessageDiv.style.display = "none";
  // Show the edit form now that we have the data
  editUserForm.style.display = "block";
}

// When the page loads, check if a user ID is provided in the URL
const userIdToEdit = getUserIdFromUrl();

// If we have a user ID, fetch the user data and populate the form
if (userIdToEdit) {
  // fetchUserData returns a Promise, so we use .then() to handle the result
  // When the fetch completes, the user data is passed to the callback function
  fetchUserData(userIdToEdit).then((user) => {
    // If user data was successfully fetched
    if (user) {
      populateForm(user); // Fill the form with the user data
    } else {
      // If fetchUserData returned null (an error occurred)
      loadingMessageDiv.textContent = "User not found or failed to load.";
    }
  });
} else {
  // If no user ID is in the URL, show an error and instructions
  loadingMessageDiv.textContent = "No user ID specified for editing.";
  messageDiv.textContent = "Please provide a user ID in the URL (e.g., user-edit.html?id=1).";
  messageDiv.style.color = "orange"; // Orange to indicate a warning
}

// Add an event listener for the form submission
// When the user clicks the Submit button, this function runs
editUserForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission (which would reload the page)
  event.preventDefault();
  
  // Clear any previous messages
  messageDiv.textContent = "";
  messageDiv.style.color = "";

  // Get the updated values from the form inputs
  const userId = userIdInput.value; // The user ID from the hidden input
  const updatedUsername = editUsernameInput.value.trim(); // The new username
  const updatedEmail = editEmailInput.value.trim(); // The new email

  // Validate that we have a user ID (we need this to know which user to update)
  if (!userId) {
    messageDiv.textContent = "Missing user ID. Cannot update the user.";
    messageDiv.style.color = "red";
    return; // Exit the function early
  }

  // Validate that both username and email are filled in
  if (!updatedUsername || !updatedEmail) {
    messageDiv.textContent = "Username and email are required.";
    messageDiv.style.color = "red";
    return; // Exit the function early
  }

  // Create an object with the updated user data
  const updatedUserData = {
    username: updatedUsername, // New username
    email: updatedEmail, // New email
  };

  // Try to send the update request to the API
  try {
    // Send a PUT request to update the user
    // PUT means we're updating an existing resource
    // The URL becomes: http://localhost:3000/users/5 (where 5 is the user ID)
    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: "PUT", // PUT is used for updates
      headers: {
        "Content-Type": "application/json", // We're sending JSON data
      },
      body: JSON.stringify(updatedUserData), // Convert the object to JSON
    });

    // Parse the response body if it's JSON
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    // Check if the update was successful (200 = OK)
    if (response.status === 200) {
      messageDiv.textContent = "User updated successfully.";
      messageDiv.style.color = "green";
      // After 1000 milliseconds (1 second), redirect to the users list page
      // This gives the user time to see the success message
      setTimeout(() => {
        window.location.href = "users.html"; // Redirect to users list
      }, 1000);
      return; // Exit the function
    }

    // If the user wasn't found (404 status)
    if (response.status === 404) {
      messageDiv.textContent = "User not found. It may have been deleted.";
      messageDiv.style.color = "red";
      return; // Exit the function
    }

    // For any other unsuccessful status, throw an error
    throw new Error(responseBody.error || responseBody.message || "Failed to update user.");
  } catch (error) {
    // If any error occurred in the try block
    console.error("Error updating user:", error); // Log for debugging
    messageDiv.textContent = `Failed to update user: ${error.message}`; // Show error message
    messageDiv.style.color = "red"; // Color it red
  }
});
