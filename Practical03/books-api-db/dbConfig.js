// Database configuration for the Books API practical.
// These values tell the app how to connect to the local SQL Server instance.

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
