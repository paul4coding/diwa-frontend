import { describe, it, expect } from 'vitest'

/**
 * Tests unitaires — logique de classification des messages du chat.
 *
 * La logique est extraite de ChatComposant.tsx pour être testée en isolation.
 * Vérifie que les types de messages sont correctement identifiés.
 */

// ─── Logique extraite du composant ───────────────────────────────────────────

interface ChatMessage {
  id: number
  contenu: string
  auteurNom: string
  roleAuteur: string
  createdAt: string
  lu: boolean
  type?: string
}

function classifierMessage(m: ChatMessage): {
  isSystème: boolean
  isRemise: boolean
  isCoupon: boolean
} {
  return {
    isSystème: m.roleAuteur === 'SYSTEME',
    isRemise:  m.type === 'DEMANDE_REMISE',
    isCoupon:  m.type === 'COUPON_APPLIQUE',
  }
}

function isMyMessage(m: ChatMessage, username?: string, prenom?: string): boolean {
  return m.auteurNom === username ||
    (prenom != null && m.auteurNom.includes(prenom))
}

function demandeRemiseTexte(): string {
  return '🎟️ Bonjour, je souhaite obtenir une remise sur ce devis. Pouvez-vous me proposer un coupon de réduction ?'
}

// ─── classifierMessage ────────────────────────────────────────────────────────
describe('classifierMessage', () => {
  it('Message ordinaire client → toutes les flags à false', () => {
    const m: ChatMessage = { id: 1, contenu: 'Bonjour', auteurNom: 'Paul', roleAuteur: 'ROLE_CLIENT', createdAt: '', lu: false }
    const cls = classifierMessage(m)
    expect(cls.isSystème).toBe(false)
    expect(cls.isRemise).toBe(false)
    expect(cls.isCoupon).toBe(false)
  })

  it('Message système (SYSTEME) → isSystème = true', () => {
    const m: ChatMessage = { id: 2, contenu: 'Bienvenue', auteurNom: 'Système DIWA', roleAuteur: 'SYSTEME', createdAt: '', lu: false }
    expect(classifierMessage(m).isSystème).toBe(true)
  })

  it('COUPON_APPLIQUE → isCoupon = true, isSystème = true', () => {
    const m: ChatMessage = {
      id: 3, contenu: '🎉 Coupon appliqué', auteurNom: 'Système DIWA',
      roleAuteur: 'SYSTEME', type: 'COUPON_APPLIQUE', createdAt: '', lu: false,
    }
    const cls = classifierMessage(m)
    expect(cls.isSystème).toBe(true)
    expect(cls.isCoupon).toBe(true)
    expect(cls.isRemise).toBe(false)
  })

  it('DEMANDE_REMISE → isRemise = true, isSystème = false', () => {
    const m: ChatMessage = {
      id: 4, contenu: demandeRemiseTexte(), auteurNom: 'Paul',
      roleAuteur: 'ROLE_CLIENT', type: 'DEMANDE_REMISE', createdAt: '', lu: false,
    }
    const cls = classifierMessage(m)
    expect(cls.isRemise).toBe(true)
    expect(cls.isSystème).toBe(false)
    expect(cls.isCoupon).toBe(false)
  })
})

// ─── isMyMessage ─────────────────────────────────────────────────────────────
describe('isMyMessage', () => {
  it("Auteur correspond au username exact → true", () => {
    const m: ChatMessage = { id: 1, contenu: '', auteurNom: 'admin', roleAuteur: 'ROLE_ADMIN', createdAt: '', lu: false }
    expect(isMyMessage(m, 'admin')).toBe(true)
  })

  it("Auteur contient le prénom → true", () => {
    const m: ChatMessage = { id: 2, contenu: '', auteurNom: 'Paul Tcheoua', roleAuteur: 'ROLE_CLIENT', createdAt: '', lu: false }
    expect(isMyMessage(m, undefined, 'Paul')).toBe(true)
  })

  it("Auteur différent → false", () => {
    const m: ChatMessage = { id: 3, contenu: '', auteurNom: 'Marie Dupont', roleAuteur: 'ROLE_RECEPTIONNISTE', createdAt: '', lu: false }
    expect(isMyMessage(m, 'admin', 'Paul')).toBe(false)
  })
})

// ─── demandeRemiseTexte ────────────────────────────────────────────────────────
describe('demandeRemiseTexte', () => {
  it('Contient le mot "remise"', () => {
    expect(demandeRemiseTexte()).toContain('remise')
  })

  it('Contient l\'emoji coupon 🎟️', () => {
    expect(demandeRemiseTexte()).toContain('🎟️')
  })

  it('Contient "coupon de réduction"', () => {
    expect(demandeRemiseTexte()).toContain('coupon de réduction')
  })
})
