import { describe, it, expect } from 'vitest'
import { formatDuree, libelleTypeRemise } from '../utils/proformaUtils'

/**
 * Tests unitaires — proformaUtils.ts
 *
 * Couvre :
 *  1. formatDuree       — cas limites (0, <60, pile 1h, mixte)
 *  2. libelleTypeRemise — les deux types
 */

// ─── formatDuree ─────────────────────────────────────────────────────────────
describe('formatDuree', () => {
  it('0 min → "0 min"', () => {
    expect(formatDuree(0)).toBe('0 min')
  })

  it('valeur négative → "0 min"', () => {
    expect(formatDuree(-10)).toBe('0 min')
  })

  it('30 min (< 1h) → "30 min"', () => {
    expect(formatDuree(30)).toBe('30 min')
  })

  it('59 min → "59 min"', () => {
    expect(formatDuree(59)).toBe('59 min')
  })

  it('60 min (pile 1h) → "1h"', () => {
    expect(formatDuree(60)).toBe('1h')
  })

  it('120 min (pile 2h) → "2h"', () => {
    expect(formatDuree(120)).toBe('2h')
  })

  it('90 min → "1h 30min"', () => {
    expect(formatDuree(90)).toBe('1h 30min')
  })

  it('125 min → "2h 5min"', () => {
    expect(formatDuree(125)).toBe('2h 5min')
  })

  it('1 min → "1 min"', () => {
    expect(formatDuree(1)).toBe('1 min')
  })
})

// ─── libelleTypeRemise ────────────────────────────────────────────────────────
describe('libelleTypeRemise', () => {
  it('POURCENTAGE → "Pourcentage (%)"', () => {
    expect(libelleTypeRemise('POURCENTAGE')).toBe('Pourcentage (%)')
  })

  it('MONTANT_FIXE → "Montant fixe (FCFA)"', () => {
    expect(libelleTypeRemise('MONTANT_FIXE')).toBe('Montant fixe (FCFA)')
  })
})
