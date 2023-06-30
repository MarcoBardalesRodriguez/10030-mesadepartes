const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

sqlite3.verbose()

const conn = async () => {
    return open({
        filename: './db.db',
        driver: sqlite3.Database
    })
}

module.exports = {
    conn
}