// Practical 03 - Students API with SQL Server
// Exam cheat sheet: CRUD for Students table in SQL Server.

const express = require("express"); // Import Express.
const sql = require("mssql"); // Import SQL Server driver.
const dbConfig = require("./dbConfig"); // Load DB config.

const app = express(); // Create app.
const port = process.env.PORT || 3000; // Port number.

app.use(express.json()); // Parse JSON input.
app.use(express.urlencoded({ extended: false })); // Parse form input.

// --- GET all students ---
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT student_id, name, address
      FROM Students
    `;

    const request = connection.request();
    const result = await request.query(sqlQuery);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving students");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- GET student by ID ---
app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      SELECT student_id, name, address
      FROM Students
      WHERE student_id = @id
    `;

    const request = connection.request();
    request.input("id", studentId);

    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Student not found");
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /students/${studentId}:`, error);
    res.status(500).send("Error retrieving student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- POST create student ---
app.post("/students", async (req, res) => {
  const newStudentData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      INSERT INTO Students (name, address)
      VALUES (@name, @address);

      SELECT SCOPE_IDENTITY() AS student_id;
    `;

    const request = connection.request();
    request.input("name", newStudentData.name);
    request.input("address", newStudentData.address);

    const result = await request.query(sqlQuery);

    const newStudentId = result.recordset[0].student_id;

    const getStudentQuery = `
      SELECT student_id, name, address
      FROM Students
      WHERE student_id = @id
    `;

    const getStudentRequest = connection.request();
    getStudentRequest.input("id", newStudentId);

    const newStudentResult =
      await getStudentRequest.query(getStudentQuery);

    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- PUT update student ---
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  const updatedStudentData = req.body;

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      UPDATE Students
      SET name = @name,
          address = @address
      WHERE student_id = @id
    `;

    const request = connection.request();
    request.input("id", studentId);
    request.input("name", updatedStudentData.name);
    request.input("address", updatedStudentData.address);

    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    const getUpdatedStudentQuery = `
      SELECT student_id, name, address
      FROM Students
      WHERE student_id = @id
    `;

    const getUpdatedStudentRequest = connection.request();
    getUpdatedStudentRequest.input("id", studentId);

    const updatedStudentResult =
      await getUpdatedStudentRequest.query(getUpdatedStudentQuery);

    res.status(200).json(updatedStudentResult.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /students/${studentId}:`, error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- DELETE student ---
app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);

    const sqlQuery = `
      DELETE FROM Students
      WHERE student_id = @id
    `;

    const request = connection.request();
    request.input("id", studentId);

    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    res.status(204).send("Student deleted successfully");
  } catch (error) {
    console.error(`Error in DELETE /students/${studentId}:`, error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

// --- Server startup ---
app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  console.log(`Server listening on port ${port}`);
});

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");

  await sql.close();

  console.log("Database connection closed");
  process.exit(0);
});