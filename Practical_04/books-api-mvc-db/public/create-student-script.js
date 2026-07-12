const createStudentForm = document.getElementById("createStudentForm");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

createStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  messageDiv.textContent = "";

  const nameInput = document.getElementById("name");
  const ageInput = document.getElementById("age");
  const emailInput = document.getElementById("email");

  const newStudentData = {
    name: nameInput.value,
    age: parseInt(ageInput.value),
    email: emailInput.value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudentData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 201) {
      messageDiv.textContent = `Student created successfully! ID: ${responseBody.id}`;
      messageDiv.style.color = "green";
      createStudentForm.reset();
      console.log("Created Student:", responseBody);
    } else if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.error || responseBody.message}`;
      messageDiv.style.color = "red";
      console.error("Validation Error:", responseBody);
    } else {
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.error || responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error creating student:", error);
    messageDiv.textContent = `Failed to create student: ${error.message}`;
    messageDiv.style.color = "red";
  }
});