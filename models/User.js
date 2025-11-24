// models/User.js
const bcrypt = require('bcrypt');
const { run, get } = require('../config/db.js'); // usa db.js async/await
const SALT_ROUNDS = 10;

class User {
    // Cria um novo usuário
    static async create(username, email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
            const result = await run(sql, [username, email, hashedPassword]);
            return { id: result.lastID, username, email };
        } catch (error) {
            // Se UNIQUE constraint falhar (usuário já existe)
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Nome de usuário já existe.');
            }
            throw new Error('Erro ao criar usuário: ' + error.message);
        }
    }

    // Busca usuário pelo username
    static async findByUsername(username) {
        try {
            const sql = `SELECT * FROM users WHERE username = ?`;
            const user = await get(sql, [username]);
            return user || null;
        } catch (error) {
            throw new Error('Erro ao buscar usuário: ' + error.message);
        }
    }

    // Compara senha fornecida com a hash do banco
    static async comparePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new Error('Erro ao comparar senha: ' + error.message);
        }
    }
}

module.exports = User;
