📌 QuickTask – Sistema de Gerenciamento de Tarefas (MVC + Node.js + SQLite)

O QuickTask é um sistema web completo de gerenciamento de tarefas desenvolvido com Node.js, arquitetura MVC, views em EJS e banco de dados SQLite.
O projeto permite cadastro de usuários, login, criação e gerenciamento avançado de tarefas (CRUD), estatísticas e interface moderna.

Este sistema foi desenvolvido como atividade acadêmica (A3) e demonstra domínio de backend, frontend e estruturação profissional de projetos.

---

🎯 Funcionalidades Principais

* Cadastro de usuários
* Login e autenticação com sessão
* CRUD completo de tarefas
* Definir prioridade, categoria, descrição e prazo
* Editar tarefas existentes
* Marcar como concluída / não concluída
* Estatísticas pessoais
* Views renderizadas em EJS
* Banco de dados SQLite totalmente integrado
* Sem LocalStorage — tudo é persistido no banco real

---

🏗️ Arquitetura do Projeto (MVC)

O projeto segue uma estrutura clara e modular:

```
/config          → Configuração do banco SQLite (db.js)
/models          → Manipulação de dados (Users/Tasks)
/routes          → Rotas da aplicação
/views           → Templates EJS (HTML dinâmico)
/public/css      → Arquivos CSS
/public/uploads  → Imagens e arquivos enviados
app.js           → Arquivo principal do servidor
package.json     → Dependências do projeto
```

---

🗄️Banco de Dados — SQLite

O banco de dados é criado automaticamente no arquivo:

```
/config/database.sqlite
```

Tabelas

📍 users

* id
* username
* email
* password

📍 tasks

* id
* title
* description
* priority
* category
* completed
* due_date
* created_at
* user_id (chave estrangeira)

➡️ Nenhuma parte do sistema usa LocalStorage.
Toda a persistência é feita com SQL real.

---

🚀 Como Executar o Projeto na Sua Máquina

1️⃣ Clonar o repositório

```bash
git clone https://github.com/DavidsonAPS/Trabalho-Faculdade-A3
```

2️⃣ Entrar na pasta

```bash
cd Trabalho-Faculdade-A3
```

3️⃣ Instalar as dependências*

```bash
npm install
```

4️⃣ Executar o projeto

```bash
node app.js
```

5️⃣ Abrir no navegador

```
http://localhost:3000
```

A aplicação iniciará automaticamente e o banco será criado caso não exista.

---

📚 Objetivo Acadêmico (A3)

Este projeto foi criado com o intuito de demonstrar:

* Conhecimento em desenvolvimento backend com Node.js
* Aplicação real da arquitetura MVC
* Persistência de dados em banco relacional
* Desenvolvimento full-stack (frontend + backend)
* Controle de sessão e autenticação
* Estrutura profissional de pastas
* Separação de responsabilidades (models, controllers, views, rotas)

---

📝Tecnologias Utilizadas

* Node.js
* Express
* SQLite3
* EJS (template engine)
* Express-Session
* Body-Parser
* BCrypt (hash de senhas — se ativado)
* CSS3 / JavaScript
* Path / FS nativos

---

👨‍💻 Como usar o QuickTask

1. Acesse o sistema no navegador
2. Crie uma conta
3. Faça login
4. Adicione tarefas
5. Edite, conclua ou exclua quando necessário
6. Utilize as estatísticas para visualizar seu desempenho
7. Logout quando terminar

---

Licença

Projeto de uso academicamente orientado — permitido para estudos e demonstrações.


