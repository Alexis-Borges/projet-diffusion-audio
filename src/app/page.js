"use client";
import { useRef, useState } from "react";
import MusicPlayer from "../components/MusicPlayer";
import MonitoringDashboard from "@/components/MonitoringDashboard";

export default function Home() {
  const [text, setText] = useState("");
  const [announcementName, setAnnouncementName] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const musicRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleAnnouncementNameChange = (e) => {
    setAnnouncementName(e.target.value);
  };

  const generateAnnouncement = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Réduire temporairement le volume de la musique
      if (musicRef.current) {
        musicRef.current.volume = 0.2;
      }
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        // Ajouter la nouvelle annonce avec le nom fourni
        setAnnouncements((prev) => [
          ...prev,
          { url, name: announcementName || "Annonce TTS" },
        ]);
      } else {
        setErrorMsg("Erreur lors de la génération de l'audio.");
        console.error("Erreur lors de la génération de l'audio");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de l'appel API.");
      console.error("Erreur lors de l'appel API:", error);
    } finally {
      setLoading(false);
      if (musicRef.current) {
        setTimeout(() => {
          musicRef.current.volume = 1.0;
        }, 3000);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Diffusion Audio en Pharmacie</h1>
      <MusicPlayer musicRef={musicRef} announcements={announcements} />

      <div className="mt-8 p-4 border rounded">
        <h2 className="text-2xl font-semibold mb-4">
          Génération dannonces audio
        </h2>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={announcementName}
          onChange={handleAnnouncementNameChange}
          placeholder="Entrez le nom de l'annonce"
        />
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={text}
          onChange={handleTextChange}
          placeholder="Entrez le texte de l'annonce ici"
        />

        <button
          onClick={generateAnnouncement}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Génération en cours..." : "Générer l'annonce"}
        </button>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </div>
    </div>
  );
}
