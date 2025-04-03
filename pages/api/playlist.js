import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  const { method } = req;
  // userId est obligatoire pour toutes les opérations, playlistId pour PUT/DELETE
  const { userId, playlistId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    switch (method) {
      case "GET": {
        // Récupérer toutes les playlists de l'utilisateur
        const result = await pool.query(
          "SELECT * FROM playlist WHERE user_id = $1 ORDER BY id ASC",
          [userId]
        );
        return res.status(200).json({ playlists: result.rows });
      }
      case "POST": {
        // Créer une nouvelle playlist pour l'utilisateur
        // On attend dans le body : { name: string, tracks: array }
        const { name, tracks } = req.body;
        if (!name || !tracks) {
          return res
            .status(400)
            .json({ error: "Name and tracks are required" });
        }
        const insertResult = await pool.query(
          "INSERT INTO playlist (user_id, name, tracks) VALUES ($1, $2, $3) RETURNING *",
          [userId, name, JSON.stringify(tracks)]
        );
        return res.status(201).json({ playlist: insertResult.rows[0] });
      }
      case "PUT": {
        // Mise à jour d'une playlist existante
        if (!playlistId) {
          return res
            .status(400)
            .json({ error: "playlistId is required for update" });
        }
        const { name, tracks } = req.body;
        if (!name && !tracks) {
          return res
            .status(400)
            .json({ error: "At least one of name or tracks must be provided" });
        }
        let updateFields = [];
        let values = [];
        let counter = 1;
        if (name) {
          updateFields.push(`name = $${counter++}`);
          values.push(name);
        }
        if (tracks) {
          updateFields.push(`tracks = $${counter++}`);
          values.push(JSON.stringify(tracks));
        }
        updateFields = updateFields.join(", ");
        const query = `UPDATE playlist SET ${updateFields} WHERE id = $${counter} AND user_id = $${
          counter + 1
        } RETURNING *`;
        values.push(playlistId, userId);
        const updateResult = await pool.query(query, values);
        if (updateResult.rows.length === 0) {
          return res
            .status(404)
            .json({ error: "Playlist not found or not authorized" });
        }
        return res.status(200).json({ playlist: updateResult.rows[0] });
      }
      case "DELETE": {
        // Suppression d'une playlist existante
        if (!playlistId) {
          return res
            .status(400)
            .json({ error: "playlistId is required for deletion" });
        }
        const deleteResult = await pool.query(
          "DELETE FROM playlist WHERE id = $1 AND user_id = $2",
          [playlistId, userId]
        );
        if (deleteResult.rowCount === 0) {
          return res
            .status(404)
            .json({ error: "Playlist not found or not authorized" });
        }
        return res
          .status(200)
          .json({ message: "Playlist deleted successfully" });
      }
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error handling playlist:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
