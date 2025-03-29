import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import path from "path";
import fs from "fs";

// Initialiser le client Google Cloud Text-to-Speech
const client = new TextToSpeechClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Le texte est requis" });
    }

    // Définir la configuration de la demande Text-to-Speech
    const request = {
      input: { text },
      // Définir la voix et la langue
      voice: { languageCode: "fr-FR", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    try {
      // Demande d'audio à l'API Google
      const [response] = await client.synthesizeSpeech(request);

      // Créer un fichier audio temporaire pour l'envoyer en réponse
      const audioFilePath = path.join(__dirname, "audio.mp3");
      fs.writeFileSync(audioFilePath, response.audioContent, "binary");

      res.setHeader("Content-Type", "audio/mp3");
      res.sendFile(audioFilePath, (err) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ error: "Erreur lors de la lecture du fichier audio" });
        }
      });
    } catch (error) {
      console.error("Erreur lors de la génération de l'audio :", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
