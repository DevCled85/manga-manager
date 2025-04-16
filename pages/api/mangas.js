// pages/api/mangas/index.js

import { openDB } from '../../lib/database';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const db = await openDB();

  // GET: Listar todos os mangás
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      let mangas;

      if (id) {
        mangas = await db.all('SELECT * FROM mangas WHERE id = ?', [id]);
      } else {
        mangas = await db.all('SELECT * FROM mangas');
      }

      // Converte o campo "comentario" de string JSON para array
      const mangasFormatados = mangas.map(manga => {
        let comentarioArray = [];
        try {
          comentarioArray = JSON.parse(manga.comentario);
        } catch (error) {
          // Se ocorrer erro na conversão, definimos como array vazio
          comentarioArray = [];
        }
        return {
          ...manga,
          comentario: comentarioArray,
          favorito: Boolean(manga.favorito)
        };
      });

      return res.json(mangasFormatados);
    } catch (error) {
      console.error('Erro ao buscar mangás:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // POST: Criar novo mangá
  if (req.method === 'POST') {
    const { titulo, capa, categoria, fonte, qtdCapitulos, bio } = req.body;

    try {
      // console.log('Dados recebidos no POST:', req.body);

      const now = new Date();
      const offsetAmazonas = 4 * 60 * 60 * 1000; // 4 horas em milissegundos
      const dataAmazonas = new Date(now.getTime() - offsetAmazonas);

      const dataHoraLocal = dataAmazonas.toISOString().replace("T", " ").substring(0, 19);

      await db.run(
        `INSERT INTO mangas 
          (
            titulo, imagem, categoria, fonte, capitulosTotal,
            capitulosLidos, status, favorito, comentario,
            data, capitulosFalta, bio
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          titulo,
          capa,
          categoria,
          fonte,
          qtdCapitulos,
          "0",
          "não iniciada",
          false,
          JSON.stringify([]),
          dataHoraLocal,
          qtdCapitulos,
          bio
        ]
      );

      // Após a inserção, busca a lista atualizada de mangás
      const updatedMangas = await db.all('SELECT * FROM mangas');
      // await db.close();

      return res.status(201).json({
        success: true,
        mangas: updatedMangas,
        message: "Mangá cadastrado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao cadastrar mangá:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar mangá' });
    }
  }

  // DELETE: Deletar um mangá
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "O ID é obrigatório" });
      }

      await db.run(`DELETE FROM mangas WHERE id = ?;`, [id]);

      return res.status(200).json({ success: true, message: "Mangá deletada com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar mangá" });
    }
  }

  // PATCH: Atualizar dados
  if (req.method === 'PATCH') {

    try {
      const { id } = req.query;

      // console.log(req.body);

      if (!id) {
        return res.status(400).json({ error: "O ID é obrigatório" });
      }

      const { titulo, capa, bio, fonte, status, detalhes, comentarios, favoritos } = req.body;

      // Cria um objeto com os dados enviados
      const update = {};
      if (titulo) update.titulo = titulo
      if (capa) update.imagem = capa
      if (bio) update.bio = bio
      if (fonte) update.fonte = fonte
      if (status) update.status = status
      if (detalhes) update.capitulosLidos = detalhes
      if (comentarios) update.comentario = JSON.stringify(comentarios); // Convertendo para JSON
      if (favoritos !== undefined) update.favorito = favoritos ? 1 : 0;

      console.log(update);

      // Se o objeto 'update' estiver vazio, significa que nenhum campo foi fornecido
      if (Object.keys(update).length === 0) {
        return res.status(400).json({ error: "Nenhum campo válido para atualizar." });
      }

      // Montar a query dinamicamente com base nos campos enviados
      const fields = Object.keys(update).map(field => `${field} = ?`).join(', ');
      const values = Object.values(update);
      values.push(id); // Adiciona o ID no final para o WHERE

      // const query = `UPDATE mangas SET ${fields} WHERE id = ?`;
      const query = `UPDATE mangas SET ${fields} WHERE id = ?`;


      console.log(query);

      await db.run(query, values);

      return res.status(200).json({ success: true, message: 'Manga atualizado com sucesso!' });

    } catch (error) {
      console.error("Erro ao atualizar mangá:", error);
      return res.status(500).json({ error: "Erro ao atualizar mangá" });
    }

  }

  res.status(405).end();
}
