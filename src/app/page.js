"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const generateAudio = async () => {
    const response = await fetch("/api/generate-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    } else {
      console.error("Erreur lors de la génération de l'audio");
    }
  };

  return (
    <div>
      <h1>Génération dannonces audio</h1>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Entrez votre texte ici"
      />
      <button onClick={generateAudio}>Générer laudio</button>

      {audioUrl && (
        <div>
          <h2>Écouter lannonce :</h2>
          <audio controls>
            <source src={audioUrl} type="audio/mp3" />
            Votre navigateur ne supporte pas la balise audio.
          </audio>
        </div>
      )}
    </div>
  );
}
