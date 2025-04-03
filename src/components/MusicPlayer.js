"use client";
import { useEffect, useRef, useState } from "react";

export default function MusicPlayer({ musicRef, announcements }) {
  const internalAudioRef = useRef(null);
  const audioRef = musicRef !== undefined ? musicRef : internalAudioRef;

  // Playlist de base chargée depuis l'API, puis playlist finale que l'utilisateur peut réorganiser
  const [basePlaylist, setBasePlaylist] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  // Charger la playlist de base depuis l'API list-music une seule fois
  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const res = await fetch("/api/list-music");
        if (res.ok) {
          const data = await res.json();
          console.log("Playlist récupérée :", data.files);
          // Construire les URLs pour chaque fichier audio
          const files = data.files.map(
            (file) => `/music/${encodeURIComponent(file)}`
          );
          setBasePlaylist(files);
          setPlaylist(files);
        } else {
          console.error("Erreur lors du chargement de la playlist");
        }
      } catch (error) {
        console.error("Erreur lors de l'appel à l'API list-music :", error);
      }
    }
    fetchPlaylist();
  }, []);

  // Insérer les nouvelles annonces dans la playlist uniquement si elles ne sont pas déjà présentes
  useEffect(() => {
    if (announcements && announcements.length > 0) {
      // Filtrer les annonces déjà insérées dans la playlist
      const newAnnouncements = announcements.filter(
        (a) => !playlist.includes(a.url)
      );
      if (newAnnouncements.length > 0) {
        // Insérer les annonces après la piste en cours sans réinitialiser l'ordre personnalisé
        const newPlaylist = [
          ...playlist.slice(0, currentTrack + 1),
          ...newAnnouncements.map((a) => a.url),
          ...playlist.slice(currentTrack + 1),
        ];
        console.log(
          "Insertion de nouvelles annonces :",
          newAnnouncements.map((a) => a.url)
        );
        setPlaylist(newPlaylist);
      }
    }
    // On ne réagit pas si announcements est vide pour ne pas modifier l'ordre personnalisé
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements]);

  // Gérer la fin d'une piste pour passer automatiquement à la suivante
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleEnded = () => {
      console.log("La piste est terminée");
      let newIndex;
      if (shuffleMode) {
        // Construire la liste des indices valides en excluant les annonces
        let validIndexes = playlist
          .map((track, index) =>
            announcements && announcements.find((a) => a.url === track)
              ? null
              : index
          )
          .filter((index) => index !== null);
        if (validIndexes.length === 0) {
          validIndexes = playlist.map((_, index) => index);
        }
        newIndex =
          validIndexes[Math.floor(Math.random() * validIndexes.length)];
        console.log("Mode shuffle activé, passage à l'indice :", newIndex);
      } else {
        newIndex = (currentTrack + 1) % playlist.length;
        console.log("Mode séquentiel, passage à l'indice :", newIndex);
      }
      setCurrentTrack(newIndex);
      // Lancer la lecture après un court délai pour permettre la mise à jour de la source
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .catch((err) => console.error("Erreur autoplay:", err));
        }
      }, 100);
    };

    audioEl.addEventListener("ended", handleEnded);
    return () => {
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, [playlist, audioRef, shuffleMode, currentTrack, announcements]);

  // Mettre à jour la source audio quand la piste actuelle change et lancer la lecture si déjà en lecture
  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      const newSrc = playlist[currentTrack];
      console.log("Changement de piste vers :", newSrc);
      audioRef.current.src = newSrc;
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.error(err));
      }
    }
  }, [currentTrack, playlist, audioRef, isPlaying]);

  // Démarrer la lecture à la demande de l'utilisateur
  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          console.log("Lecture démarrée");
          setIsPlaying(true);
        })
        .catch((err) => console.error("Erreur lors de la lecture:", err));
    }
  };

  // Permettre à l'utilisateur de choisir une piste
  const playTrack = (index) => {
    setCurrentTrack(index);
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error(err));
      setIsPlaying(true);
    }
  };

  // Réorganiser la playlist avec des boutons emoji, en ajustant currentTrack si nécessaire
  const moveTrackUp = (index) => {
    if (index <= 0) return;
    setPlaylist((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [
        newList[index],
        newList[index - 1],
      ];
      return newList;
    });
    if (index === currentTrack) {
      setCurrentTrack(index - 1);
    } else if (index - 1 === currentTrack) {
      setCurrentTrack(index);
    }
  };

  const moveTrackDown = (index) => {
    if (index >= playlist.length - 1) return;
    setPlaylist((prev) => {
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [
        newList[index + 1],
        newList[index],
      ];
      return newList;
    });
    if (index === currentTrack) {
      setCurrentTrack(index + 1);
    } else if (index + 1 === currentTrack) {
      setCurrentTrack(index);
    }
  };

  // Extraire le nom de la piste actuelle pour affichage
  const currentTrackName =
    playlist.length > 0
      ? decodeURIComponent(playlist[currentTrack].split("/").pop())
      : "";

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">Musique </h2>
      {playlist.length === 0 ? (
        <p>Chargement de la playlist...</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            {currentTrackName && (
              <p className="mb-2 font-medium">
                Lecture en cours :{" "}
                <span className="italic">{currentTrackName}</span>
              </p>
            )}
            <button
              onClick={() => setShuffleMode(!shuffleMode)}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              ⇌ : {shuffleMode ? "Activé" : "Désactivé"}
            </button>
          </div>
          {!isPlaying && (
            <button
              onClick={startMusic}
              className="px-4 py-2 bg-green-500 text-white rounded mb-4"
            >
              Démarrer la musique
            </button>
          )}
          <audio ref={audioRef} controls style={{ width: "100%" }}>
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
          <div className="mt-4">
            <h3 className="font-semibold">Playlist complète :</h3>
            <ul className="list-disc ml-4">
              {playlist.map((track, index) => {
                const trackName = decodeURIComponent(track.split("/").pop());
                const announcementObj =
                  announcements && announcements.find((a) => a.url === track);
                // Pour les annonces, afficher le nom personnalisé suivi de "(Annonce TTS)"
                const displayName = announcementObj
                  ? `${announcementObj.name} (Annonce TTS)`
                  : trackName;
                return (
                  <li key={index} className="flex items-center">
                    <span
                      onClick={() => playTrack(index)}
                      className={`cursor-pointer ${
                        index === currentTrack ? "text-blue-600" : ""
                      }`}
                    >
                      {displayName}
                    </span>
                    <div className="ml-2">
                      <button
                        onClick={() => moveTrackUp(index)}
                        className="px-1"
                        title="Déplacer vers le haut"
                      >
                        ⇖
                      </button>
                      <button
                        onClick={() => moveTrackDown(index)}
                        className="px-1"
                        title="Déplacer vers le bas"
                      >
                        ⇘
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
