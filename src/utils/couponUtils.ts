/**
 * Fonctions utilitaires — Coupons de Réduction
 * Extraites de AdminCouponsPage pour être testables indépendamment.
 */

export interface CouponStat {
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  valeur: number
  actif: boolean
  expire: boolean
  epuise: boolean
  valide: boolean
}

/**
 * Formate la valeur d'un coupon selon son type.
 * @example formatMontant({ typeRemise: 'POURCENTAGE', valeur: 10, ... }) → "10 %"
 * @example formatMontant({ typeRemise: 'MONTANT_FIXE', valeur: 5000, ... }) → "5 000 FCFA"
 */
export function formatMontant(c: CouponStat): string {
  return c.typeRemise === 'POURCENTAGE'
    ? `${c.valeur} %`
    : `${c.valeur.toLocaleString()} FCFA`
}

/** Badge de statut avec couleur et fond selon l'état du coupon. */
export function badgeStatut(c: CouponStat): { label: string; color: string; bg: string } {
  if (!c.actif) return { label: 'Désactivé', color: '#6b7280', bg: '#f3f4f6' }
  if (c.expire)  return { label: 'Expiré',   color: '#dc2626', bg: '#fee2e2' }
  if (c.epuise)  return { label: 'Épuisé',   color: '#92400e', bg: '#fef3c7' }
  return { label: 'Actif', color: '#166534', bg: '#dcfce7' }
}
