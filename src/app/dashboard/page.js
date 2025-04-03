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
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const musicRef = useRef(null);

  // Récupérer les playlists de l'utilisateur
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchPlaylists();
    }
  }, [session, status]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`/api/playlist?userId=${session.user.id}`);
      const data = await res.json();
      setPlaylists(data.playlists || []);
      // Sélectionne la première playlist par défaut
      if (data.playlists && data.playlists.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(data.playlists[0].id.toString());
      }
    } catch (err) {
      console.error("Erreur lors du chargement des playlists", err);
    }
  };

  // Création d'une nouvelle playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) {
      setErrorMsg("Veuillez entrer un nom pour la playlist.");
      return;
    }
    setErrorMsg("");
    try {
      const res = await fetch(`/api/playlist?userId=${session.user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName, tracks: [] }),
      });
      if (res.ok) {
        setNewPlaylistName("");
        fetchPlaylists();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erreur lors de la création de la playlist.");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API", error);
      setErrorMsg("Erreur lors de l'appel API");
    }
  };

  // Fonction pour ajouter une piste à la playlist sélectionnée
  const addToSelectedPlaylist = async (audioUrl) => {
    if (!selectedPlaylistId) {
      setErrorMsg("Veuillez sélectionner une playlist.");
      return;
    }
    // Trouver la playlist à mettre à jour dans l'état
    const playlistToUpdate = playlists.find(
      (p) => p.id.toString() === selectedPlaylistId
    );
    if (!playlistToUpdate) {
      setErrorMsg("Playlist introuvable.");
      return;
    }
    const currentTracks = Array.isArray(playlistToUpdate.tracks)
      ? playlistToUpdate.tracks
      : [];
    const updatedTracks = [...currentTracks, audioUrl];
    try {
      const res = await fetch(
        `/api/playlist?userId=${session.user.id}&playlistId=${selectedPlaylistId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks: updatedTracks }),
        }
      );
      if (res.ok) {
        fetchPlaylists();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Erreur lors de l'ajout à la playlist.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de l'appel API pour ajouter la piste.");
    }
  };

  // Callback pour l'upload : ajoute le fichier uploadé à la playlist sélectionnée
  const handleUploadSuccess = (file) => {
    // file est { url, name }
    addToSelectedPlaylist(file.url);
  };

  // Fonction pour générer une annonce TTS et l'ajouter à la playlist sélectionnée
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
        // Utiliser le nom saisi ou, par défaut, extraire le nom de l'URL
        const fileName =
          announcementName || decodeURIComponent(url.split("/").pop());
        addToSelectedPlaylist(url);
      } else {
        setErrorMsg("Erreur lors de la génération de l'audio TTS.");
        console.error("Erreur lors de la génération de l'audio TTS");
      }
    } catch (error) {
      setErrorMsg("Erreur lors de l'appel API TTS.");
      console.error("Erreur lors de l'appel API TTS:", error);
    } finally {
      if (musicRef.current) {
        setTimeout(() => {
          musicRef.current.volume = 1.0;
        }, 3000);
      }
    }
  };

  // Pour gérer le changement de la sélection de playlist dans le dropdown
  const handlePlaylistSelect = (e) => {
    setSelectedPlaylistId(e.target.value);
  };

  // Pour gérer le changement du nom de la nouvelle playlist
  const handleNewPlaylistNameChange = (e) => {
    setNewPlaylistName(e.target.value);
  };

  // Récupérer la playlist sélectionnée pour affichage
  const selectedPlaylist = playlists.find(
    (p) => p.id.toString() === selectedPlaylistId
  );

  if (status === "loading") return <p>Chargement de la session...</p>;
  if (!session) return <p>Vous n'êtes pas connecté.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* En-tête */}
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

      {/* Dropdown de sélection de playlist */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Sélectionnez une playlist
        </h2>
        {playlists.length > 0 ? (
          <select
            value={selectedPlaylistId}
            onChange={handlePlaylistSelect}
            className="p-2 border rounded w-full"
          >
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <p>Aucune playlist disponible.</p>
        )}
      </section>

      {/* Section de création d'une nouvelle playlist */}
      <section className="mb-8 border p-4 rounded">
        <h2 className="text-2xl font-semibold mb-2">
          Créer une nouvelle playlist
        </h2>
        <input
          type="text"
          value={newPlaylistName}
          onChange={handleNewPlaylistNameChange}
          placeholder="Nom de la playlist"
          className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreatePlaylist}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          Créer la playlist
        </button>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </section>

      {/* Affichage du contenu de la playlist sélectionnée */}
      <section className="mb-8 border p-4 rounded">
        <h2 className="text-2xl font-semibold mb-2">
          Contenu de la playlist sélectionnée
        </h2>
        {selectedPlaylist &&
        Array.isArray(selectedPlaylist.tracks) &&
        selectedPlaylist.tracks.length > 0 ? (
          <ul className="list-disc ml-4">
            {selectedPlaylist.tracks.map((track, idx) => (
              <li key={idx}>{track}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune piste dans cette playlist.</p>
        )}
      </section>

      {/* Section d'upload de musique */}
      <section className="mb-8">
        <UploadMusic onUploadSuccess={handleUploadSuccess} />
      </section>

      {/* Section MusicPlayer */}
      <section className="mb-8">
        <MusicPlayer musicRef={musicRef} announcements={announcements} />
      </section>

      {/* Section pour générer des annonces TTS */}
      <section className="mt-8 p-4 border rounded">
        <h2 className="text-2xl font-semibold mb-4">
          Génération d'annonces audio
        </h2>
        <input
          type="text"
          className="w-full p-2 border rounded mb-2"
          value={announcementName}
          onChange={(e) => setAnnouncementName(e.target.value)}
          placeholder="Entrez le nom de l'annonce (optionnel)"
        />
        <textarea
          className="w-full p-2 border rounded mb-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Entrez le texte de l'annonce ici"
        />
        <button
          onClick={generateAnnouncement}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Générer l'annonce TTS et l'ajouter à la playlist
        </button>
        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </section>
    </div>
  );
}
