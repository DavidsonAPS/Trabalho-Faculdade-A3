// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Carrega banco de dados
require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares para parsing de requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'umasecretabemsegura',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // em dev, HTTPS não obrigatório
}));

// Middleware global para disponibilizar o usuário logado nas views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Rota inicial
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Bem-vindo ao To-Do List!',
        message: 'Faça login ou cadastre-se para começar a gerenciar suas tarefas.'
    });
});

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Rotas de tarefas
const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
