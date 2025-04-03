"use client";
import { useState } from "react";

export default function UploadMusic({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload-music", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMessage(`Fichier uploadé avec succès : ${data.url}`);
        // Récupérer le nom du fichier depuis la réponse de l'API
        const fileName = data.name;
        if (onUploadSuccess) {
          onUploadSuccess({ url: data.url, name: fileName });
        }
      } else {
        setUploadMessage(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("Erreur lors de l'upload");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Uploader une musique</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={handleFileChange}
          accept="audio/*"
          className="mb-4"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Upload
        </button>
      </form>
      {uploadMessage && <p className="mt-2">{uploadMessage}</p>}
    </div>
  );
}
