const { Pool, Client } = require('pg');

const dbclient = new Client({
    user: 'akyuu',
    host: 'localhost',
    database: 'kosuzudb',
    port: 5432
});

module.exports = { dbclient };