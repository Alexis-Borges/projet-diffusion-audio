"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const generateAudio = async () => {
    setLoading(true);
    setErrorMsg("");
    setAudioUrl(null); // Réinitialiser l'URL audio avant de générer un nouveau
    try {
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
        setErrorMsg("Erreur lors de la génération de l'audio.");
        console.error("Erreur lors de la génération de l'audio");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de l'appel API.");
      console.error("Erreur lors de l'appel API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Génération dannonces audio</h1>
      <textarea
        className="w-full p-2 border rounded"
        value={text}
        onChange={handleTextChange}
        placeholder="Entrez votre texte ici"
      />
      <button
        onClick={generateAudio}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        aria-label="Générer l'audio"
      >
        {loading ? "Génération en cours..." : "Générer l'audio"}
      </button>
      {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}

      {audioUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Écouter lannonce :</h2>
          <audio controls src={audioUrl}>
            Votre navigateur ne supporte pas la balise audio.
          </audio>
        </div>
      )}
    </div>
  );
}
