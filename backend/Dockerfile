# ================================================
# DOCKERFILE BACKEND — Développement
# ================================================

# Image de base : Node.js version 20, variante Alpine
# Alpine = Linux ultra-léger (~5MB vs ~900MB pour Ubuntu)
FROM node:20-alpine

# Définir le répertoire de travail dans le container
# Toutes les commandes suivantes s'exécutent depuis /app
WORKDIR /app

# ── Copier les fichiers de dépendances D'ABORD ──
# Pourquoi ? Docker met en cache chaque étape.
# Si on copie tout d'abord, le cache est invalidé
# à chaque changement de code. En copiant package.json
# séparément, npm install est mis en cache tant que
# les dépendances ne changent pas → build plus rapide !
COPY package*.json ./

# Installer les dépendances
RUN npm install

# ── Copier le reste du code ──────────────────────
COPY . .

# Documenter le port exposé (informatif)
EXPOSE 4000

# Commande de démarrage
# On utilise nodemon pour le hot-reload en développement
CMD ["npm", "run", "dev"]