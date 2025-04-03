import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Désactive le body parser de Next.js pour gérer le multipart
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const uploadDir = path.join(process.cwd(), "public", "music");

  // Créer le dossier s'il n'existe pas
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true, // Conserve l'extension originale
    maxFileSize: 10 * 1024 * 1024, // Limite à 10 Mo par exemple
    filename: (name, ext, part) => {
      // Utiliser le nom original fourni par le client
      return part.originalFilename;
    },
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Erreur lors du parsing du formulaire :", err);
      return res.status(500).json({ error: "Erreur lors de l'upload" });
    }

    // On suppose que le champ file est nommé "file"
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "Aucun fichier uploadé" });
    }

    const oldPath = file.filepath;
    const finalFileName = file.originalFilename || file.newFilename;
    const newPath = path.join(uploadDir, finalFileName);

    fs.rename(oldPath, newPath, (renameErr) => {
      if (renameErr) {
        console.error("Erreur lors du renommage du fichier :", renameErr);
        return res
          .status(500)
          .json({ error: "Erreur lors du traitement du fichier" });
      }

      const fileUrl = `/music/${encodeURIComponent(finalFileName)}`;
      return res.status(200).json({ url: fileUrl, name: finalFileName });
    });
  });
}
