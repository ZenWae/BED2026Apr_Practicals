// ===== DATABASE CONFIGURATION FILE (dbConfig.js) =====
// This module centralizes the SQL Server connection settings used by the
// models in this project. The values are read from environment variables,
// which keeps secrets out of the source code and makes deployment easier.
// The exported object is reused by every database operation in the app.

module.exports = {
  // The database username for authentication
  user: process.env.DB_USER, // Database username from environment variables
  // The database password for authentication
  password: process.env.DB_PASSWORD, // Database password from environment variables
  // The hostname or IP address of the SQL Server
  server: process.env.DB_SERVER, // Database server hostname or IP address
  // The specific database name to connect to
  database: process.env.DB_DATABASE, // Database name to connect to
  // Whether to trust the SSL/TLS certificate from the server
  // Set to true for development/testing; false for production with valid certs
  trustServerCertificate: true, // Trust the server certificate for SSL/TLS connections
  // Additional connection options
  options: {
    // The TCP port for SQL Server (usually 1433)
    // parseInt() converts the string from environment variables to a number
    port: parseInt(process.env.DB_PORT), // TCP port for SQL Server, parsed from environment
    // How long to wait (in milliseconds) before timing out a connection attempt
    // 60000 milliseconds = 60 seconds
    connectionTimeout: 60000, // Connection timeout in milliseconds
  },
};