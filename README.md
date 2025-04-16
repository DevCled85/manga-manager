# Manga Manager - Sistema de Gerenciamento de Mangás 📚

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-3.45.1-green?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-red)](LICENSE)

## 📸 Screenshots (Atualize com suas imagens)

# Sistema completo para gerenciamento de coleções de mangás com interface web moderna e instalação desktop para Windows.

![Screenshot da Interface](public/screenshot-demo.png) <!-- Adicione uma screenshot real -->

## ✨ Funcionalidades Principais
- **CRUD Completo** (Criar, Ler, Atualizar, Deletar)
- **Organização por Categorias**
- **Sistema de Favoritos**
- **Busca Avançada**
- **Estatísticas de Leitura**
- **Interface Responsiva**
- **Instalador Windows (.exe)**

## 🛠️ Tecnologias Utilizadas
- **Frontend**: 
  - Next.js 14 + React 19
  - CSS Modules
  - Heroicons
- **Backend**:
  - API Routes (Next.js)
  - SQLite + sqlite3
- **DevOps**:
  - Inno Setup (Instalador Windows)
  - Auto-start do servidor

## 🚀 Como Executar

### Pré-requisitos
- Node.js ≥18.x
- npm ≥9.x

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/manga-manager.git

## 🛠️ Desenvolvimento
Comandos Úteis

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

Instalação via Windows
Execute o setup_manga_manager.exe

Siga as instruções do instalador

O programa estará disponível no Menu Iniciar e Desktop

## 📂 Estrutura do Projeto
manga-manager/
├── src/
│   ├── components/       # Componentes React
│   ├── lib/              # Lógica do banco de dados
│   ├── pages/            # Rotas Next.js
│   │   ├── api/          # Endpoints da API
│   │   └── ...           # Páginas principais
├── public/               # Assets estáticos
├── install/              # Configurações de instalação
└── ...                   # Outros arquivos de configuração

## 🔍 Destaques Técnicos
Arquitetura Modular: Componentes reutilizáveis e bem organizados

Segurança: Prevenção contra SQL Injection

Performance:

Server-side Rendering (Next.js)

Cache inteligente de consultas

Database:

Schema otimizado para mangás

Sistema de migrações integrado

-- Exemplo do Schema Principal
CREATE TABLE mangas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  categoria TEXT,
  status TEXT CHECK(status IN ('não iniciada', 'em andamento', 'completa')),
  favorito BOOLEAN DEFAULT 0,
  data DATETIME DEFAULT CURRENT_TIMESTAMP
);

Configuração Avançada
Edite next.config.mjs para customizar o Next.js

Modifique setup_manga_manager.iss para ajustar o instalador

## 🤝 Contribuição
Faça um Fork do projeto

Crie sua Branch (git checkout -b feature/nova-feature)

Faça Commit das Mudanças (git commit -m 'Add new feature')

Faça Push para a Branch (git push origin feature/nova-feature)

Abra um Pull Request

## 📄 Licença
Distribuído sob licença MIT. Veja LICENSE para mais detalhes.

Desenvolvido com ❤️ por Cledson N Pereira
GitHub