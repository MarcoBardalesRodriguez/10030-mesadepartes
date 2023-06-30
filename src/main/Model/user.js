const { conn } = require('./database.js')

async function userSelect (_event, query) {
    const connection = await conn()
    const result = await connection.all(query)
    await connection.close()
    return result
}

module.exports = {
    userSelect
}