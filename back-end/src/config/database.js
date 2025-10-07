// Este ficheiro estabelece a ligação com a base de dados MySQL
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Criar pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig);

module.exports = pool;