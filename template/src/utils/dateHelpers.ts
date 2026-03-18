/**
 * Date Helper Functions
 * Gère les dates en gardant l'heure locale (pas de conversion UTC)
 */

/**
 * Parse une date depuis la base en gardant l'heure locale
 * Au lieu de new Date(timestamp) qui convertit en UTC
 */
export function parseLocalDateTime(timestamp: string): Date {
  // Remplace l'espace par un T pour que ce soit un format ISO valide
  // Mais on ajoute pas de Z à la fin pour éviter la conversion UTC
  const isoString = timestamp.replace(' ', 'T');

  // Si le timestamp contient déjà un timezone, on le parse normalement
  if (isoString.includes('+') || isoString.includes('Z')) {
    // Extraire les composants et recréer en local
    const date = new Date(isoString);
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
  }

  // Sinon, on parse comme heure locale
  return new Date(isoString);
}

/**
 * Formate une date en gardant l'heure locale pour l'envoi à la base
 */
export function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
