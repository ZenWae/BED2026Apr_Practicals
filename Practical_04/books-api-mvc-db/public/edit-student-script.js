const editStudentForm = document.getElementById("editStudentForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const studentIdInput = document.getElementById("studentId");
const editNameInput = document.getElementById("editName");
const editAgeInput = document.getElementById("editAge");
const editEmailInput = document.getElementById("editEmail");

const apiBaseUrl = "http://localhost:3000";

function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchStudentData(studentId) {
  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);

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

    const student = await response.json();
    return student;
  } catch (error) {
    console.error("Error fetching student data:", error);
    messageDiv.textContent = `Failed to load student data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = "";
    return null;
  }
}

function populateForm(student) {
  studentIdInput.value = student.id;
  editNameInput.value = student.name;
  editAgeInput.value = student.age;
  editEmailInput.value = student.email;
  loadingMessageDiv.style.display = "none";
  editStudentForm.classList.remove("hidden");
}

const studentIdToEdit = getStudentIdFromUrl();

if (studentIdToEdit) {
  fetchStudentData(studentIdToEdit).then((student) => {
    if (student) {
      populateForm(student);
    } else {
      loadingMessageDiv.textContent = "Student not found or failed to load.";
      messageDiv.textContent = "Could not find the student to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  loadingMessageDiv.textContent = "No student ID specified for editing.";
  messageDiv.textContent =
    "Please provide a student ID in the URL (e.g., edit-student.html?id=1).";
  messageDiv.style.color = "orange";
}

editStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  messageDiv.textContent = "";

  const studentId = studentIdInput.value;
  const updatedStudentData = {
    name: editNameInput.value,
    age: parseInt(editAgeInput.value),
    email: editEmailInput.value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedStudentData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      messageDiv.textContent = "Student updated successfully!";
      messageDiv.style.color = "green";
      console.log("Updated Student:", responseBody);

      setTimeout(() => {
        window.location.href = "students.html";
      }, 1000);
    } else if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.error || responseBody.message}`;
      messageDiv.style.color = "red";
    } else if (response.status === 404) {
      messageDiv.textContent = `Error: ${responseBody.error || "Student not found"}`;
      messageDiv.style.color = "red";
    } else {
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.error || responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error updating student:", error);
    messageDiv.textContent = `Failed to update student: ${error.message}`;
    messageDiv.style.color = "red";
  }
});