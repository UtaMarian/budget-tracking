import sql from 'mssql';

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Encrypt connection
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // Use for local dev with self-signed certs
    },
};

// Function to connect to the database
async function connect() {
    try {
        // Attempt to connect to the database
        if (!sql.connection) {
            await sql.connect(config);
        }
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err; // Re-throw error for higher-level handling
    }
}

// Function to run a SQL query
async function query(sqlQuery) {
    try {
        const result = await sql.query(sqlQuery);
        return result;
    } catch (err) {
        console.error('Query execution failed:', err);
        throw err; // Re-throw error for higher-level handling
    }
}
const db = {
  connect,
  query,
};
// Export the connect and query functions
export default db;
