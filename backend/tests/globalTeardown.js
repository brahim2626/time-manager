// ================================================
// GLOBALTEARDOWN.JS — Exécuté UNE SEULE FOIS
// après tous les fichiers de test
// ================================================

module.exports = async () => {
  console.log('🧹 GlobalTeardown : nettoyage terminé');
};