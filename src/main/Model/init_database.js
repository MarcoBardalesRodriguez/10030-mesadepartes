const { conn } = require('./database')

async function initDatabase() {
    const connection = await conn()
    await connection.exec(`
        CREATE TABLE IF NOT EXISTS users (
        username TEXT NOT NULL UNIQUE, 
        password TEXT NOT NULL)
    `)
    await connection.exec(`
        CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT DEFAULT CURRENT_DATE,
        log_from TEXT NOT NULL,
        log_to TEXT NOT NULL,
        description TEXT)
    `);
    await connection.exec(`
        INSERT INTO users (username, password)
        VALUES ("admin", "admin")
        ON CONFLICT DO NOTHING
    `);

    console.log('Database initialized')

    await connection.close()
}

module.exports = {
    initDatabase
}