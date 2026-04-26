// ================================================
// CLOCKLOGIC.TEST.JS — Tests unitaires
// ================================================
// Les tests unitaires testent UNE SEULE fonction
// isolément, sans base de données ni serveur.
// C'est rapide et précis.
// ================================================

// ── Fonction à tester ───────────────────────────
// On recopie la logique pure ici pour la tester
// sans dépendances externes

function determineClockType(lastClock) {
  // Si pas de dernier pointage OU si c'était un clock_out
  // → on fait un clock_in
  // Sinon → on fait un clock_out
  if (!lastClock || lastClock.type === 'clock_out') {
    return 'clock_in';
  }
  return 'clock_out';
}

function calculateWorkDuration(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diff = new Date(clockOut) - new Date(clockIn);
  return Math.round(diff / 1000 / 60); // En minutes
}

function formatDuration(minutes) {
  if (minutes < 0) return '0h 0min';
  const h   = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${h}h ${min}min`;
}

// ── Les tests ───────────────────────────────────
// "describe" = groupe de tests liés
// "it" ou "test" = un test individuel
// "expect" = la vérification

describe('🕐 Logique de pointage (Clock Toggle)', () => {

  describe('determineClockType()', () => {

    it('doit retourner clock_in si pas de pointage précédent', () => {
      const result = determineClockType(null);
      // expect(valeur).toBe(attendu)
      expect(result).toBe('clock_in');
    });

    it('doit retourner clock_in si le dernier était clock_out', () => {
      const lastClock = { type: 'clock_out' };
      const result = determineClockType(lastClock);
      expect(result).toBe('clock_in');
    });

    it('doit retourner clock_out si le dernier était clock_in', () => {
      const lastClock = { type: 'clock_in' };
      const result = determineClockType(lastClock);
      expect(result).toBe('clock_out');
    });

  });

  describe('calculateWorkDuration()', () => {

    it('doit calculer 8h = 480 minutes', () => {
      const clockIn  = '2024-03-01T09:00:00';
      const clockOut = '2024-03-01T17:00:00';
      const result   = calculateWorkDuration(clockIn, clockOut);
      expect(result).toBe(480);
    });

    it('doit retourner 0 si les dates sont manquantes', () => {
      expect(calculateWorkDuration(null, null)).toBe(0);
      expect(calculateWorkDuration('2024-03-01', null)).toBe(0);
    });

    it('doit calculer 30 minutes correctement', () => {
      const clockIn  = '2024-03-01T09:00:00';
      const clockOut = '2024-03-01T09:30:00';
      expect(calculateWorkDuration(clockIn, clockOut)).toBe(30);
    });

  });

  describe('formatDuration()', () => {

    it('doit formater 90 minutes en "1h 30min"', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });

    it('doit formater 0 minutes en "0h 0min"', () => {
      expect(formatDuration(0)).toBe('0h 0min');
    });

    it('doit formater 480 minutes en "8h 0min"', () => {
      expect(formatDuration(480)).toBe('8h 0min');
    });

    it('doit gérer les valeurs négatives', () => {
      expect(formatDuration(-10)).toBe('0h 0min');
    });

  });

});