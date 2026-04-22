# ================================================
# DOCKERFILE FRONTEND — Développement
# ================================================

FROM node:20-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

EXPOSE 3000

# Vite démarre le serveur de dev avec hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# --host 0.0.0.0 = rend le serveur accessible depuis l'extérieur
# du container (sinon il n'écoute que sur localhost interne)