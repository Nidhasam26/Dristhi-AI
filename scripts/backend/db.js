import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "drishti_ai",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
});

try {
    await pool.query("SELECT 1 AS connected");
    console.log("✅ MySQL connected successfully!");
} catch (error) {
    await pool.end();
    throw new Error(`MySQL connection failed: ${error.message}`);
}

export default pool;