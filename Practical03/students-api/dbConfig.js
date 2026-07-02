// Database configuration for the Students API practical.
// These settings allow the app to connect to the SQL Server database.

module.exports = {
  user: "booksapi_user", // SQL Server login username.
  password: "1234567890", // SQL Server login password.
  server: "localhost", // Database server host name.
  database: "bed_db", // Target database name.
  trustServerCertificate: true, // Allow local SSL certificate trust.
  options: {
    port: 1433, // Default SQL Server port.
    connectionTimeout: 60000, // Wait up to 60 seconds for the connection.
  },
};
