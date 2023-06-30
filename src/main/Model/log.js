const { conn } = require('./database.js')

// interface Log {
//     id: number; //opcional autoincrement
//     date: string; //opcional current_date
//     log_from: string;
//     log_to: string;
//     description: string;
// }

async function newLog (_event, log) {
    const connection = await conn()
    const stm = await connection.prepare(`
        INSERT INTO logs (log_from, log_to, description) 
        VALUES (@log_from, @log_to, @description)
    `)
    stm.bind({
        '@log_from': log.log_from, 
        '@log_to': log.log_to, 
        '@description': log.description
    })
    await stm.run()
    await stm.finalize()
    connection.close()
}

async function getLogs(_event, start, step) {
    const connection = await conn();
    const stm = await connection.prepare(`
          SELECT * FROM logs ORDER BY id DESC LIMIT @start, @step
      `);
    stm.bind({
      '@start': start,
      '@step': step,
    });
    const rows = await stm.all();
    await stm.finalize();
    connection.close();
    return rows;
}

async function getLogsByDate(_event, date) {
    const connection = await conn();
    const stm = await connection.prepare(`
          SELECT * FROM logs WHERE date = @date
      `);
    stm.bind({
      '@date': date,
    });
    const rows = await stm.all();
    await stm.finalize();
    connection.close();
    return rows;
}

async function getLog(_event, id) {
    const connection = await conn();
    const stm = await connection.prepare(`
            SELECT * FROM logs WHERE id = @id
        `);
    stm.bind({
        '@id': id,
    });
    const rows = await stm.get();
    await stm.finalize();
    connection.close();
    return rows;
}

async function updateLog(_event, log) {
    const connection = await conn();
    const stm = await connection.prepare(`
            UPDATE logs SET log_from = @log_from, log_to = @log_to, description = @description WHERE id = @id
        `);
    stm.bind({
        '@id': log.id,
        '@log_from': log.log_from,
        '@log_to': log.log_to,
        '@description': log.description,
    });
    await stm.run();
    await stm.finalize();
    connection.close();
}

async function deleteLog(_event, id) {
    const connection = await conn();
    const stm = await connection.prepare(`
            DELETE FROM logs WHERE id = @id
        `);
    stm.bind({
        '@id': id,
    });
    await stm.run();
    await stm.finalize();
    connection.close();
}

// function que buscara considencias en el texto de fecha, log_from, log_to y description
async function searchLog(_event, text) {
    const connection = await conn();
    // return on order desc
    const stm = await connection.prepare(`
            SELECT * FROM logs WHERE date LIKE @text OR log_from LIKE @text OR log_to LIKE @text OR description LIKE @text ORDER BY id DESC
        `);
    stm.bind({
        '@text': `%${text}%`,
    });
    const rows = await stm.all();
    await stm.finalize();
    connection.close();
    return rows;
}

module.exports = {
    newLog,
    getLogs,
    getLog,
    updateLog,
    deleteLog,
    searchLog
}