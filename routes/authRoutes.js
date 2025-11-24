// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Formulário de registro
router.get('/register', (req, res) => {
    res.render('register', { title: 'Registrar', error: req.query.error });
});

// Processa registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.redirect('/auth/register?error=Todos os campos são obrigatórios.');
    }

    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.redirect('/auth/register?error=Nome de usuário já existe.');
        }

        await User.create(username, email, password);
        res.redirect('/auth/login?message=Registro bem-sucedido! Faça login.');
    } catch (error) {
        console.error('Erro no registro do usuário:', error.message);
        res.redirect(`/auth/register?error=${encodeURIComponent(error.message)}`);
    }
});

// Formulário de login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        error: req.query.error,
        message: req.query.message
    });
});

// Processa login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect('/auth/login?error=Preencha nome de usuário e senha.');
    }

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            return res.redirect('/auth/login?error=Nome de usuário ou senha inválidos.');
        }

        const passwordMatch = await User.comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.redirect('/auth/login?error=Nome de usuário ou senha inválidos.');
        }

        // Define a sessão
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        res.redirect('/tasks'); // redireciona para tarefas
    } catch (error) {
        console.error('Erro no login do usuário:', error);
        res.redirect('/auth/login?error=Erro ao fazer login. Tente novamente.');
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login?message=Você foi desconectado.');
    });
});

module.exports = router;
