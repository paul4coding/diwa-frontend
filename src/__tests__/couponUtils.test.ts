import { describe, it, expect } from 'vitest'
import { formatMontant, badgeStatut, type CouponStat } from '../utils/couponUtils'

/**
 * Tests unitaires — couponUtils.ts
 *
 * Couvre :
 *  1. formatMontant — POURCENTAGE, MONTANT_FIXE, grands montants
 *  2. badgeStatut   — tous les états (actif, inactif, expiré, épuisé)
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeCoupon(overrides: Partial<CouponStat> = {}): CouponStat {
  return {
    typeRemise: 'POURCENTAGE',
    valeur: 10,
    actif: true,
    expire: false,
    epuise: false,
    valide: true,
    ...overrides,
  }
}

// ─── formatMontant ────────────────────────────────────────────────────────────
describe('formatMontant', () => {
  it('POURCENTAGE → affiche "X %"', () => {
    expect(formatMontant(makeCoupon({ typeRemise: 'POURCENTAGE', valeur: 10 }))).toBe('10 %')
  })

  it('POURCENTAGE 100% → "100 %"', () => {
    expect(formatMontant(makeCoupon({ typeRemise: 'POURCENTAGE', valeur: 100 }))).toBe('100 %')
  })

  it('MONTANT_FIXE petit → affiche "X FCFA"', () => {
    expect(formatMontant(makeCoupon({ typeRemise: 'MONTANT_FIXE', valeur: 5000 }))).toBe(
      `${(5000).toLocaleString()} FCFA`
    )
  })

  it('MONTANT_FIXE grand → formatage locale appliqué', () => {
    const coupon = makeCoupon({ typeRemise: 'MONTANT_FIXE', valeur: 100000 })
    const result = formatMontant(coupon)
    // La valeur doit contenir 100000 formaté (séparateur de milliers selon locale)
    expect(result).toContain('FCFA')
    expect(result).not.toContain('%')
  })
})

// ─── badgeStatut ──────────────────────────────────────────────────────────────
describe('badgeStatut', () => {
  it('Coupon actif, non expiré, non épuisé → label "Actif", couleur verte', () => {
    const badge = badgeStatut(makeCoupon())
    expect(badge.label).toBe('Actif')
    expect(badge.color).toBe('#166534')
    expect(badge.bg).toBe('#dcfce7')
  })

  it('Coupon inactif (actif=false) → "Désactivé", couleur grise', () => {
    const badge = badgeStatut(makeCoupon({ actif: false }))
    expect(badge.label).toBe('Désactivé')
    expect(badge.color).toBe('#6b7280')
    expect(badge.bg).toBe('#f3f4f6')
  })

  it('Coupon expiré → "Expiré", couleur rouge', () => {
    const badge = badgeStatut(makeCoupon({ expire: true }))
    expect(badge.label).toBe('Expiré')
    expect(badge.color).toBe('#dc2626')
    expect(badge.bg).toBe('#fee2e2')
  })

  it('Coupon épuisé → "Épuisé", couleur ambre', () => {
    const badge = badgeStatut(makeCoupon({ epuise: true }))
    expect(badge.label).toBe('Épuisé')
    expect(badge.color).toBe('#92400e')
    expect(badge.bg).toBe('#fef3c7')
  })

  it('Priorité inactif > expiré (actif=false ET expire=true) → "Désactivé"', () => {
    const badge = badgeStatut(makeCoupon({ actif: false, expire: true }))
    expect(badge.label).toBe('Désactivé')
  })

  it('Priorité expiré > épuisé (expire=true ET epuise=true) → "Expiré"', () => {
    const badge = badgeStatut(makeCoupon({ expire: true, epuise: true }))
    expect(badge.label).toBe('Expiré')
  })
})
