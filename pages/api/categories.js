import { openDB } from "@/lib/database";

export const config = {
    api: {
        bodyParser: true,
    },
};


export default async function handler(req, res) {
    const db = await openDB();

    // GET: Lista tdas as categorias
    if (req.method === 'GET') {
        const categories = await db.all('SELECT * FROM categories');
        return res.status(200).json(categories);
    }

    // POST: Criar nova categoria
    if (req.method === 'POST') {
        try {
            const { categoria } = req.body;

            if (!categoria) {
                return res.status(400).json({ error: "O campo Categoria é obrigatório" });
            }

            await db.run(`INSERT INTO categories (categoria) VALUES (?)`, [categoria]);

            return res.status(201).json({ success: true, mesage: "Categoria cadastra com sucesso!" });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao cadastrar categoria." });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: "O ID é obrigatório" });
            }

            await db.run(`DELETE FROM categories WHERE id = ?;`, [id]);

            return res.status(200).json({ success: true, mesage: "Categoria deletada com sucesso!" });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao deletar categoria" });
        }
    }

    res.status(405).end();
}