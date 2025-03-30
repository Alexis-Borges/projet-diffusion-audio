import axios from "axios";

export default async function handler(req, res) {
  console.log("API KEY :", process.env.GOOGLE_API_KEY);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Le texte est requis" });
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`;
  const payload = {
    input: { text },
    voice: {
      languageCode: "fr-FR",
      ssmlGender: "MALE",
      name: "fr-FR-Wavenet-B",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.9,
      pitch: -2.0,
    },
  };

  try {
    const response = await axios.post(url, payload);
    const { audioContent } = response.data;
    const audioBuffer = Buffer.from(audioContent, "base64");

    res.setHeader("Content-Type", "audio/mp3");
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error(
      "Erreur lors de la génération de l'audio:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
}
