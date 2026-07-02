// Database configuration for the MVC books API practical.
// The values are loaded from environment variables so the settings stay secure.

module.exports = {
  user: process.env.DB_USER, // SQL Server username from the environment.
  password: process.env.DB_PASSWORD, // SQL Server password from the environment.
  server: process.env.DB_SERVER, // SQL Server host name from the environment.
  database: process.env.DB_DATABASE, // Database name from the environment.
  trustServerCertificate: true, // Allow trusted local SSL certificates.
  options: {
    port: parseInt(process.env.DB_PORT), // SQL Server port from the environment.
    connectionTimeout: 60000, // Wait up to 60 seconds for a connection.
  },
};