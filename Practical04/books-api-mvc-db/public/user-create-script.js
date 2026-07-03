// ===== USER CREATE PAGE SCRIPT =====
// This script handles the user creation form on the front-end.
// It collects the user-entered values, performs a basic validation check,
// sends the data to the Express API, and communicates the result back to
// the browser so the user knows whether the record was created successfully.

// Get references to DOM elements we'll interact with
const createUserForm = document.getElementById("createUserForm"); // The form element for creating users
const messageDiv = document.getElementById("message"); // Div where we'll show success/error messages
const apiBaseUrl = "http://localhost:3000"; // Base URL for all API requests

// Add an event listener for when the form is submitted
// The 'submit' event fires when the user clicks the submit button
// 'async' allows us to use 'await' for asynchronous operations (like API calls)
createUserForm.addEventListener("submit", async (event) => {
  // Prevent the default form submission behavior (page reload)
  // Without this, the browser would reload the page and lose our custom handling
  event.preventDefault();
  
  // Clear any previous messages from the message div
  messageDiv.textContent = "";

  // Get the input elements from the form
  const usernameInput = document.getElementById("username"); // Text input for username
  const emailInput = document.getElementById("email"); // Text input for email

  // Create an object with the user data from the form inputs
  // .trim() removes whitespace from the beginning and end of the strings
  const newUserData = {
    username: usernameInput.value.trim(), // Get the username value and remove extra spaces
    email: emailInput.value.trim(), // Get the email value and remove extra spaces
  };

  // Validate that both fields have values (basic client-side validation)
  // This checks BEFORE sending to the server to catch obvious errors early
  if (!newUserData.username || !newUserData.email) {
    // If either field is empty, show an error message
    messageDiv.textContent = "Username and email are required.";
    messageDiv.style.color = "red"; // Color the message red to indicate an error
    return; // Exit the function early, don't send the request
  }

  // Use try-catch to handle potential errors during the API call
  // 'try' attempts to run the code; 'catch' handles any errors that occur
  try {
    // Send a POST request to the /users endpoint
    // 'fetch' makes an HTTP request to the specified URL
    // The second parameter is an object with request options
    const response = await fetch(`${apiBaseUrl}/users`, {
      method: "POST", // POST means we're creating a new resource
      headers: {
        // Headers provide metadata about the request
        "Content-Type": "application/json", // Tells the server the body contains JSON data
      },
      // body: the data we're sending to the server
      // JSON.stringify() converts our JavaScript object to a JSON string
      body: JSON.stringify(newUserData),
    });

    // Check if the response contains JSON data
    // Some responses might be plain text or other formats
    const responseBody = response.headers
      .get("content-type") // Get the content-type header from the response
      ?.includes("application/json") // Check if it contains "application/json"
      ? await response.json() // If JSON, parse it as JSON
      : { message: response.statusText }; // Otherwise, use the status text

    // Check if the request was successful (201 = Created)
    // HTTP status codes: 2xx = success, 4xx = client error, 5xx = server error
    if (response.status === 201) {
      // Success! The user was created
      messageDiv.textContent = `User created successfully! ID: ${responseBody.id}`; // Show success message with the new user's ID
      messageDiv.style.color = "green"; // Color the message green for success
      createUserForm.reset(); // Clear all form fields for the next entry
      return; // Exit the function
    }

    // If the status was not 201, throw an error with details from the response
    throw new Error(responseBody.error || responseBody.message || "Failed to create user.");
  } catch (error) {
    // This catches any errors that occurred in the try block
    // Errors could be network issues, JSON parsing errors, or thrown errors
    console.error("Error creating user:", error); // Log the error to the browser console for debugging
    messageDiv.textContent = `Failed to create user: ${error.message}`; // Show the error message to the user
    messageDiv.style.color = "red"; // Color the error message red
  }
});
