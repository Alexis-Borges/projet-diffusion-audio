# Utilise une image Node.js légère (ici Node 18 Alpine)
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock) et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code de l'application
COPY . .

# Exposer le port sur lequel Next.js tourne (par défaut 3000)
EXPOSE 3000

# Exécuter les migrations Knex (si tu as des migrations) puis démarrer l'application Next.js
CMD ["sh", "-c", "npx knex migrate:latest --env development && npm run start"]
