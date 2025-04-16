import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Configuração inicial
export async function openDB() {
  return open({
    filename: './mangas.db',
    driver: sqlite3.Database
  });
}

// Criar tabela
export async function setupDB() {
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mangas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      imagem TEXT,
      titulo TEXT NOT NULL,
      fonte TEXT,
      categoria TEXT,
      capitulosTotal TEXT,

      capitulosLidos TEXT,
      status TEXT,
      favorito BOOLEAN DEFAULT 0,
      comentario TEXT,
      
      data DATETIME,
      capitulosFalta TEXT
    )
  `);

  // Criar tabela de cadastro de categorias
  await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
        "id"	INTEGER,
        "categoria"	TEXT NOT NULL,
        PRIMARY KEY("id" AUTOINCREMENT)
      );
    `)
  await db.close();
}

export async function updateDB() {
  const db = await openDB();

  // Adicionar coluna bio se não existir
  await db.exec(`ALTER TABLE mangas ADD COLUMN bio TEXT DEFAULT '';`);

  // Adicionar coluna comentarios se não existir (armazenada como JSON)
  // await db.exec(`ALTER TABLE mangas ADD COLUMN comentarios TEXT DEFAULT '[]';`);

  await db.close();
}
// updateDB();



// setupDB()