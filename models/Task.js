const { run, get, all } = require('../config/db');

// Criar nova tarefa
async function addTask(user_id, title, description, priority, category, due_date) {
    const sql = `
        INSERT INTO tasks (user_id, title, description, priority, category, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await run(sql, [user_id, title, description, priority, category, due_date || null]);
}

// Buscar tarefas de um usuário com filtros e ordenação
async function getTasks(user_id, filters = {}) {
    let sql = `SELECT * FROM tasks WHERE user_id = ?`;
    const params = [user_id];

    if (filters.status === 'completed') sql += ` AND completed = 1`;
    if (filters.status === 'pending') sql += ` AND completed = 0`;
    if (filters.priority) { sql += ` AND priority = ?`; params.push(filters.priority); }
    if (filters.category) { sql += ` AND category LIKE ?`; params.push(`%${filters.category}%`); }

    const orderBy = filters.orderBy || 'created_at';
    const orderDirection = filters.orderDirection === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${orderBy} ${orderDirection}`;

    const tasks = await all(sql, params);
    return tasks;
}

// Buscar tarefa por ID
async function getTaskById(id) {
    const sql = `SELECT * FROM tasks WHERE id = ?`;
    const task = await get(sql, [id]);
    return task || null;
}

// Editar tarefa
async function updateTask(id, title, description, priority, category, due_date) {
    const sql = `
        UPDATE tasks SET title=?, description=?, priority=?, category=?, due_date=?
        WHERE id=?
    `;
    await run(sql, [title, description, priority, category, due_date || null, id]);
}

// Excluir tarefa
async function deleteTask(id) {
    const sql = `DELETE FROM tasks WHERE id = ?`;
    await run(sql, [id]);
}

// Alternar conclusão da tarefa
async function toggleComplete(id) {
    const task = await getTaskById(id);
    if (!task) throw new Error('Tarefa não encontrada');

    const sql = `UPDATE tasks SET completed = ? WHERE id = ?`;
    await run(sql, [task.completed ? 0 : 1, id]);
}

// Estatísticas do usuário
async function getStats(user_id) {
    const total = await get(`SELECT COUNT(*) AS count FROM tasks WHERE user_id = ?`, [user_id]);
    const completed = await get(`SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND completed = 1`, [user_id]);
    const pending = await get(`SELECT COUNT(*) AS count FROM tasks WHERE user_id = ? AND completed = 0`, [user_id]);

    const byCategory = await all(`
        SELECT category, COUNT(*) AS count FROM tasks
        WHERE user_id = ?
        GROUP BY category
    `, [user_id]);

    const byPriority = await all(`
        SELECT priority, COUNT(*) AS count FROM tasks
        WHERE user_id = ?
        GROUP BY priority
    `, [user_id]);

    return {
        total: total.count,
        completed: completed.count,
        pending: pending.count,
        byCategory,
        byPriority
    };
}

// Tarefas próximas do vencimento (7 dias)
async function getUpcomingDueTasks(user_id) {
    const today = new Date();
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);

    const sql = `
        SELECT * FROM tasks
        WHERE user_id = ? AND due_date BETWEEN ? AND ?
        ORDER BY due_date ASC
    `;
    const tasks = await all(sql, [user_id, today.toISOString().split('T')[0], next7.toISOString().split('T')[0]]);
    return tasks;
}

module.exports = {
    addTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    toggleComplete,
    getStats,
    getUpcomingDueTasks
};
