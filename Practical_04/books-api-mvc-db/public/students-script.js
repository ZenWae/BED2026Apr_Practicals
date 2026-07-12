const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Fetch all students and display them
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = "Loading students...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/students`);

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

    const students = await response.json();

    studentsListDiv.innerHTML = "";
    if (students.length === 0) {
      studentsListDiv.innerHTML = "<p>No students found.</p>";
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.id);
        studentElement.innerHTML = `
                    <h3>${student.name}</h3>
                    <p>Age: ${student.age}</p>
                    <p>Email: ${student.email}</p>
                    <p>ID: ${student.id}</p>
                    <button onclick="viewStudentDetails(${student.id})">View Details</button>
                    <button onclick="editStudent(${student.id})">Edit</button>
                    <button class="delete-btn" data-id="${student.id}">Delete</button>
                `;
        studentsListDiv.appendChild(studentElement);
      });

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<p style="color: red;">Failed to load students: ${error.message}</p>`;
  }
}

// View student details
async function viewStudentDetails(studentId) {
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
    alert(
      `Student Details:\n\nID: ${student.id}\nName: ${student.name}\nAge: ${student.age}\nEmail: ${student.email}`
    );
  } catch (error) {
    console.error("Error fetching student details:", error);
    alert(`Failed to load student details: ${error.message}`);
  }
}

function editStudent(studentId) {
  window.location.href = `edit-student.html?id=${studentId}`;
}

// Delete a student
async function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");

  const confirmed = confirm(`Are you sure you want to delete student ID ${studentId}?`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      messageDiv.textContent = `Student ID ${studentId} deleted successfully.`;
      messageDiv.style.color = "green";

      const studentElement = document.querySelector(
        `[data-student-id="${studentId}"]`
      );
      if (studentElement) {
        studentElement.remove();
      }
    } else if (response.status === 404) {
      const errorBody = await response.json();
      messageDiv.textContent = `Error: ${errorBody.error || "Student not found"}`;
      messageDiv.style.color = "red";
    } else {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.error || errorBody.message}`
      );
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    messageDiv.textContent = `Failed to delete student: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

fetchStudentsBtn.addEventListener("click", fetchStudents);
window.addEventListener("load", fetchStudents);