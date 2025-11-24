// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../config/db');

// Middleware para checar se o usuário está logado
function checkAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Listar tarefas com filtros, ordenação e próximas do vencimento
router.get('/', checkAuth, async (req, res) => {
    const userId = req.session.user.id;

    const filterStatus = req.query.status || '';
    const filterPriority = req.query.priority || '';
    const filterCategory = req.query.category || '';
    const orderBy = req.query.orderBy || 'created_at';
    const orderDirection = req.query.orderDirection === 'ASC' ? 'ASC' : 'DESC';

    try {
        let query = `SELECT * FROM tasks WHERE user_id = ?`;
        const params = [userId];

        if (filterStatus) {
            query += ` AND completed = ?`;
            params.push(filterStatus === 'completed' ? 1 : 0);
        }

        if (filterPriority) {
            query += ` AND priority = ?`;
            params.push(filterPriority);
        }

        if (filterCategory) {
            query += ` AND category LIKE ?`;
            params.push(`%${filterCategory}%`);
        }

        query += ` ORDER BY ${orderBy} ${orderDirection}`;

        const tasks = await all(query, params);

        // Tarefas com prazo nos próximos 7 dias
        const today = new Date();
        const next7 = new Date();
        next7.setDate(today.getDate() + 7);

        const upcomingDueTasks = tasks.filter(t => {
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date);
            return dueDate >= today && dueDate <= next7 && t.completed === 0;
        });

        res.render('tasks', {
            tasks,
            currentFilters: { filterStatus, filterPriority, filterCategory, orderBy, orderDirection },
            upcomingDueTasks,
            message: req.session.message || '',
            error: req.session.error || ''
        });

        // Limpar mensagens
        req.session.message = '';
        req.session.error = '';

    } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
        res.render('tasks', { tasks: [], currentFilters: {}, upcomingDueTasks: [], error: 'Erro ao carregar tarefas.', message: '' });
    }
});

// Adicionar tarefa
router.post('/add', checkAuth, async (req, res) => {
    const { title, description, priority, category, due_date } = req.body;
    const userId = req.session.user.id;

    try {
        await run(
            `INSERT INTO tasks (title, description, priority, category, due_date, completed, user_id, created_at)
             VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`,
            [title, description, priority, category, due_date || null, userId]
        );
        req.session.message = 'Tarefa adicionada com sucesso!';
    } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        req.session.error = 'Erro ao adicionar tarefa.';
    }
    res.redirect('/tasks');
});

// Editar tarefa (GET)
router.get('/edit/:id', checkAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user.id;

    try {
        const task = await get(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`, [taskId, userId]);
        if (!task) {
            req.session.error = 'Tarefa não encontrada.';
            return res.redirect('/tasks');
        }
        res.render('editTask', { task, error: '' });
    } catch (err) {
        console.error('Erro ao buscar tarefa:', err);
        req.session.error = 'Erro ao buscar tarefa.';
        res.redirect('/tasks');
    }
});

// Editar tarefa (POST)
router.post('/edit/:id', checkAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user.id;
    const { title, description, priority, category, due_date, completed } = req.body;

    try {
        await run(
            `UPDATE tasks SET title=?, description=?, priority=?, category=?, due_date=?, completed=? WHERE id=? AND user_id=?`,
            [title, description, priority, category, due_date || null, completed ? 1 : 0, taskId, userId]
        );
        req.session.message = 'Tarefa atualizada com sucesso!';
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
        req.session.error = 'Erro ao atualizar tarefa.';
    }
    res.redirect('/tasks');
});

// Excluir tarefa
router.post('/delete/:id', checkAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user.id;

    try {
        await run(`DELETE FROM tasks WHERE id=? AND user_id=?`, [taskId, userId]);
        req.session.message = 'Tarefa excluída com sucesso!';
    } catch (err) {
        console.error('Erro ao excluir tarefa:', err);
        req.session.error = 'Erro ao excluir tarefa.';
    }
    res.redirect('/tasks');
});

// Toggle Conclusão
router.post('/toggle-complete/:id', checkAuth, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.session.user.id;

    try {
        const task = await get(`SELECT completed FROM tasks WHERE id=? AND user_id=?`, [taskId, userId]);
        if (!task) {
            req.session.error = 'Erro ao atualizar status.';
            return res.redirect('/tasks');
        }
        const newStatus = task.completed ? 0 : 1;
        await run(`UPDATE tasks SET completed=? WHERE id=? AND user_id=?`, [newStatus, taskId, userId]);
        req.session.message = newStatus ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como pendente!';
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        req.session.error = 'Erro ao atualizar status.';
    }
    res.redirect('/tasks');
});

// Estatísticas de produtividade
router.get('/statistics', checkAuth, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const tasks = await all(`SELECT * FROM tasks WHERE user_id=?`, [userId]);

        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        const byCategory = [];
        const categoriesMap = {};
        tasks.forEach(t => {
            const cat = t.category || 'Sem Categoria';
            if (!categoriesMap[cat]) categoriesMap[cat] = 0;
            categoriesMap[cat]++;
        });
        for (const cat in categoriesMap) {
            byCategory.push({ category: cat, count: categoriesMap[cat] });
        }

        const byPriority = [];
        const prioritiesMap = {};
        tasks.forEach(t => {
            const prio = t.priority || 'Sem Prioridade';
            if (!prioritiesMap[prio]) prioritiesMap[prio] = 0;
            prioritiesMap[prio]++;
        });
        for (const prio in prioritiesMap) {
            byPriority.push({ priority: prio, count: prioritiesMap[prio] });
        }

        res.render('statistics', {
            user: req.session.user,
            stats: { total, completed, pending, byCategory, byPriority },
            message: '',
            error: ''
        });
    } catch (err) {
        console.error('Erro ao gerar estatísticas:', err);
        res.render('statistics', { user: req.session.user, stats: null, error: 'Erro ao carregar estatísticas.', message: '' });
    }
});

module.exports = router;
