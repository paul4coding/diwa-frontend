/**
 * Fonctions utilitaires — Pro Forma
 * Extraites de CreationProFormaV1 pour être testables indépendamment.
 */

/**
 * Formate une durée en minutes en chaîne lisible.
 * @example formatDuree(0)   → "0 min"
 * @example formatDuree(30)  → "30 min"
 * @example formatDuree(60)  → "1h"
 * @example formatDuree(90)  → "1h 30min"
 * @example formatDuree(125) → "2h 5min"
 */
export function formatDuree(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/**
 * Détermine le libellé de type de remise pour l'affichage.
 */
export function libelleTypeRemise(type: 'POURCENTAGE' | 'MONTANT_FIXE'): string {
  return type === 'POURCENTAGE' ? 'Pourcentage (%)' : 'Montant fixe (FCFA)'
}
