// ==================================================
// STORE.JS — Données temporaires en mémoire
// (Sera remplacé par PostgreSQL à l'étape 4)
// ==================================================

// Liste des utilisateurs (tableau d'objets)
const users = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Dupont',
    email: 'alice@primebank.fr',
    role: 'manager',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Martin',
    email: 'bob@primebank.fr',
    role: 'employee',
    createdAt: new Date('2024-02-01')
  }
];

// Liste des équipes
const teams = [
  {
    id: 1,
    name: 'Équipe Finance',
    description: 'Département finance de PrimeBank',
    managerId: 1,
    members: [1, 2]
  }
];

// Liste des pointages (clock-in / clock-out)
const clocks = [
  {
    id: 1,
    userId: 2,
    type: 'clock_in',
    clockedAt: new Date('2024-03-01T09:05:00')
  },
  {
    id: 2,
    userId: 2,
    type: 'clock_out',
    clockedAt: new Date('2024-03-01T17:30:00')
  }
];

// Compteurs pour les IDs (simule l'auto-increment de la DB)
let nextUserId = 3;
let nextTeamId = 2;
let nextClockId = 3;

// On exporte tout pour pouvoir l'utiliser ailleurs
module.exports = {
  users,
  teams,
  clocks,
  getNextUserId: () => nextUserId++,
  getNextTeamId: () => nextTeamId++,
  getNextClockId: () => nextClockId++
};