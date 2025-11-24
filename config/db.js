// config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados (cria o arquivo se não existir)
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco SQLite em', dbPath);
    }
});

// Criação da tabela de usuários (se não existir)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        password TEXT NOT NULL
    )
`, (err) => {
    if (err) console.error('Erro ao criar tabela users:', err.message);
});

// Criação da tabela de tarefas (se não existir)
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'Baixa',
        category TEXT,
        completed INTEGER DEFAULT 0,
        due_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`, (err) => {
    if (err) console.error('Erro ao criar tabela tasks:', err.message);
});

// Função para executar queries (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Função para retornar um único registro (SELECT ... LIMIT 1)
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Função para retornar múltiplos registros (SELECT)
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    db,
    run,
    get,
    all
};
