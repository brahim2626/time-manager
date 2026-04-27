# ⏱️ Time Manager

[![🚀 CI Pipeline](https://github.com/brahim2626/time-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/brahim2626/time-manager/actions/workflows/ci.yml)
[![🔒 Security](https://github.com/brahim2626/time-manager/actions/workflows/security.yml/badge.svg)](https://github.com/brahim2626/time-manager/actions/workflows/security.yml)

Application de gestion du temps de travail pour PrimeBank.

## 🏗️ Stack technique
- **Backend** : Node.js + Express + JWT
- **Frontend** : React + Vite
- **Base de données** : PostgreSQL
- **Infrastructure** : Docker + Nginx

## 🚀 Lancer le projet

```bash
# Copier et configurer les variables
cp .env.example .env

# Lancer tout avec Docker
docker-compose up -d

# Ouvrir dans le navigateur
open http://localhost
```

## 🧪 Lancer les tests

```bash
cd backend
npm test              # Lancer les tests
npm run test:coverage # Avec rapport de couverture
```

## 📋 Comptes de test
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| alice@primebank.fr | password123 | Manager |
| bob@primebank.fr | password123 | Employé |

## 👥 Contribuer
1. Crée une branche : `git checkout -b feat/ma-fonctionnalite`
2. Commits : `git commit -m "feat: description"`
3. Push : `git push origin feat/ma-fonctionnalite`
4. Ouvre une Pull Request vers `develop`