import { readdir } from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  try {
    const musicDir = path.join(process.cwd(), "public", "music");
    const files = await readdir(musicDir);
    // Filtrer uniquement les fichiers audio (.mp3 ou .wav)
    const audioFiles = files.filter(
      (file) => file.endsWith(".mp3") || file.endsWith(".wav")
    );
    console.log("Fichiers trouvés :", audioFiles);
    return res.status(200).json({ files: audioFiles });
  } catch (err) {
    console.error("Erreur lors de la lecture du dossier:", err);
    return res
      .status(500)
      .json({ error: "Erreur lors de la lecture du dossier" });
  }
}
