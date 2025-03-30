"use client";
import { useEffect, useState } from "react";

export default function MonitoringDashboard() {
  const [totalChars, setTotalChars] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/monitoring");
      if (!res.ok)
        throw new Error("Erreur lors de la récupération des métriques");
      const data = await res.json();
      setTotalChars(data.totalCharacters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Optionnel : Recharger les métriques périodiquement (par exemple toutes les 5 minutes)
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">
        Monitoring - Caractères traités TTS
      </h2>
      {loading && <p>Chargement des métriques...</p>}
      {error && <p className="text-red-500">Erreur: {error}</p>}
      {totalChars !== null && (
        <p>
          Total de caractères traités sur la dernière heure :{" "}
          <span className="font-bold">{totalChars}</span>
        </p>
      )}
    </div>
  );
}
