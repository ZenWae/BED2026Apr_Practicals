// ===== USER VIEW PAGE SCRIPT =====
// This script fetches one user record and displays its details in a simple
// read-only page. It is used to confirm the values stored for the selected
// user before navigating to the edit screen or returning to the user list.

// Get references to DOM elements where we'll display the user data
const loadingMessageDiv = document.getElementById("loadingMessage"); // Shows "Loading..." while fetching
const userDetailsDiv = document.getElementById("userDetails"); // Container for the user details
const messageDiv = document.getElementById("message"); // Shows error messages
const userIdValue = document.getElementById("userIdValue"); // Span for displaying user ID
const userUsernameValue = document.getElementById("userUsernameValue"); // Span for displaying username
const userEmailValue = document.getElementById("userEmailValue"); // Span for displaying email
const apiBaseUrl = "http://localhost:3000"; // Base URL for API requests

// Extract the user ID from the URL query string
function getUserIdFromUrl() {
  // window.location.search gets everything after the ? in the URL
  // For example: ?id=5 or ?id=10
  const params = new URLSearchParams(window.location.search);
  // Get the value of the "id" parameter
  return params.get("id");
}

// Fetch user data from the API
async function fetchUserData(userId) {
  try {
    // Make a GET request to fetch the user by ID
    const response = await fetch(`${apiBaseUrl}/users/${userId}`);
    
    // Check if the response is successful
    if (!response.ok) {
      // Parse the error details
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      
      // Handle 404 (Not Found) specifically
      if (response.status === 404) {
        throw new Error("User not found.");
      }
      // For other errors, include the status code and message
      throw new Error(`HTTP ${response.status}: ${errorBody.error || errorBody.message}`);
    }
    
    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    // Handle any errors that occurred
    console.error("Error fetching user details:", error); // Log the error
    loadingMessageDiv.style.display = "none"; // Hide loading message
    userDetailsDiv.style.display = "none"; // Hide details section
    messageDiv.textContent = `Failed to load user details: ${error.message}`; // Show error
    messageDiv.style.color = "red"; // Color it red
    return null; // Return null to indicate failure
  }
}

// Display the user data on the page
function populateUserDetails(user) {
  // Set the text content of the span elements to show the user data
  userIdValue.textContent = user.id; // Display the user ID
  userUsernameValue.textContent = user.username; // Display the username
  userEmailValue.textContent = user.email; // Display the email
  
  // Hide the loading message since we have the data
  loadingMessageDiv.style.display = "none";
  
  // Clear any error messages
  messageDiv.textContent = "";
  
  // Show the user details section
  userDetailsDiv.style.display = "block";
}

// When the page loads, check if a user ID is provided in the URL
const userIdToView = getUserIdFromUrl();

// If no user ID is provided, show an error
if (!userIdToView) {
  loadingMessageDiv.style.display = "none"; // Hide loading message
  messageDiv.textContent = "No user ID specified in the URL."; // Show error
  messageDiv.style.color = "red"; // Color it red
} else {
  // If we have a user ID, fetch and display the user data
  fetchUserData(userIdToView).then((user) => {
    // When the fetch completes, check if we got data
    if (user) {
      // If we have user data, populate the page with it
      populateUserDetails(user);
    }
    // If user is null (error occurred), the error message was already shown by fetchUserData
  });
}
