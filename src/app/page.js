"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import UploadMusic from "@/components/UploadMusic";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [errorMsg, setErrorMsg] = useState("");
  const [text, setText] = useState("");
  const [announcementName, setAnnouncementName] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const musicRef = useRef(null);

  // Gère le changement du texte pour le TTS
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Gère le changement du nom de l'annonce
  const handleAnnouncementNameChange = (e) => {
    setAnnouncementName(e.target.value);
  };

  // Callback appelée quand un fichier est uploadé avec succès
  // Si aucun nom d'annonce n'est saisi, on utilise le nom du fichier uploadé
  const handleUploadSuccess = (file) => {
    const nameToUse = announcementName || file.name;
    setAnnouncements((prev) => [...prev, { url: file.url, name: nameToUse }]);
  };

  // Fonction pour générer une annonce TTS et l'ajouter aux annonces
  const generateAnnouncement = async () => {
    setErrorMsg("");
    try {
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
        // Utiliser le nom saisi par l'utilisateur ou, par défaut, extraire un nom à partir de l'URL
        const fileName =
          announcementName || decodeURIComponent(url.split("/").pop());
        setAnnouncements((prev) => [...prev, { url, name: fileName }]);
      } else {
        setErrorMsg("Erreur lors de la génération de l'audio.");
        console.error("Erreur lors de la génération de l'audio");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de l'appel API.");
      console.error("Erreur lors de l'appel API:", error);
    } finally {
      if (musicRef.current) {
        setTimeout(() => {
          musicRef.current.volume = 1.0;
        }, 3000);
      }
    }
  };

  if (status === "loading") return <p>Chargement de la session...</p>;
  if (!session) return <p>Vous n'êtes pas connecté.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* En-tête du Dashboard */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() =>
            signOut({ redirect: true, callbackUrl: "/auth/signin" })
          }
          className="bg-red-500 text-white p-2 rounded"
        >
          Se déconnecter
        </button>
      </div>

      {/* Section d'upload de musique */}
      <section className="mb-8">
        <UploadMusic onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Section MusicPlayer */}
      <section className="mb-8">
        <MusicPlayer musicRef={musicRef} announcements={announcements} />
      </section>

      {/* Section de génération d'annonces TTS */}
      <section className="mt-8 p-4 border rounded">
        <h2 className="text-2xl font-semibold mb-4">
          Génération d'annonces audio
        </h2>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={announcementName}
          onChange={handleAnnouncementNameChange}
          placeholder="Entrez le nom de l'annonce (optionnel)"
        />
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={text}
          onChange={handleTextChange}
          placeholder="Entrez le texte de l'annonce ici"
        />
        <button
          onClick={generateAnnouncement}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Générer l'annonce
        </button>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </section>
    </div>
  );
}
