import { MetricServiceClient } from "@google-cloud/monitoring";

export default async function handler(req, res) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      throw new Error(
        "La variable d'environnement GOOGLE_CLOUD_PROJECT n'est pas définie"
      );
    }

    const client = new MetricServiceClient();
    const projectName = client.projectPath(projectId);

    // Intervalle des 60 dernières minutes
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);

    const request = {
      name: projectName,
      filter: 'metric.type="texttospeech.googleapis.com/characters_processed"',
      interval: {
        startTime: { seconds: Math.floor(startTime.getTime() / 1000) },
        endTime: { seconds: Math.floor(endTime.getTime() / 1000) },
      },
      view: "FULL",
    };

    const [timeSeries] = await client.listTimeSeries(request);
    let totalCharacters = 0;
    timeSeries.forEach((series) => {
      series.points.forEach((point) => {
        totalCharacters += parseInt(point.value.int64Value || "0", 10);
      });
    });

    res.status(200).json({ totalCharacters });
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques :", error);
    res.status(500).json({ error: error.message });
  }
}
