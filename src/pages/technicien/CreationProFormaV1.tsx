import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  Wrench,
  ClipboardList,
  AlertCircle,
  Link2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { formatDuree } from '../../utils/proformaUtils'

/* ─── Types ─────────────────────────────────────────────── */
interface MOAssociee {
  typeIntervention: string
  dureeMinutes: number
}

interface LigneTravailForm {
  uid: number
  designation: string
  quantite: number
  /** MO directement liée à cette pièce (null = pas de MO) */
  moLiee: MOAssociee | null
}

interface LigneMOStandalone {
  uid: number
  typeIntervention: string
  dureeMinutes: number
}

/* ─── Utilitaires durée (import depuis proformaUtils) ───── */

/** Input minutes → affiche "Xh Ym" en temps réel */
function DureeInput({
  value,
  onChange,
  placeholder = '30',
}: {
  value: number
  onChange: (v: number) => void
  placeholder?: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#f0f9ff', padding: '10px 14px',
      borderRadius: 12, border: '1px solid #bae6fd', minWidth: 130,
    }}>
      <Clock size={14} color="#0284c7" />
      <input
        type="number"
        min={0}
        step={5}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => {
          const v = parseInt(e.target.value, 10)
          onChange(isNaN(v) ? 0 : v)
        }}
        style={{
          width: 52, padding: '0', border: 'none', background: 'transparent',
          fontWeight: 700, fontSize: '0.95rem', outline: 'none', color: '#0369a1',
          textAlign: 'center',
        }}
      />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
        min {value > 0 ? `· ${formatDuree(value)}` : ''}
      </span>
    </div>
  )
}

/* ─── Composant principal ───────────────────────────────── */
export default function CreationProFormaV1() {
  const { demandeId } = useParams()
  const navigate = useNavigate()

  const [lignesTravaux, setLignesTravaux] = useState<LigneTravailForm[]>([
    { uid: Date.now(), designation: '', quantite: 1, moLiee: null },
  ])
  const [lignesMOStandalone, setLignesMOStandalone] = useState<LigneMOStandalone[]>([])

  const { data: demande, isLoading } = useQuery({
    queryKey: ['demande', demandeId],
    queryFn: () => axiosInstance.get(`/api/v1/demandes/${demandeId}`).then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      axiosInstance.post(`/api/v1/proformas/demandes/${demandeId}/v1`, payload),
    onSuccess: () => {
      alert('Diagnostic technique transmis à la réception !')
      navigate('/admin/atelier/dashboard')
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Erreur lors de la sauvegarde.')
    },
  })

  /* ─ Helpers travaux ─ */
  const updateTravail = (index: number, patch: Partial<LigneTravailForm>) => {
    setLignesTravaux(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const addMOLiee = (index: number) => {
    updateTravail(index, {
      moLiee: { typeIntervention: '', dureeMinutes: 30 },
    })
  }

  const removeMOLiee = (index: number) => {
    updateTravail(index, { moLiee: null })
  }

  const updateMOLiee = (index: number, patch: Partial<MOAssociee>) => {
    setLignesTravaux(prev =>
      prev.map((l, i) =>
        i === index ? { ...l, moLiee: l.moLiee ? { ...l.moLiee, ...patch } : null } : l,
      ),
    )
  }

  /* ─ Helpers MO standalone ─ */
  const updateMOStandalone = (index: number, patch: Partial<LigneMOStandalone>) => {
    setLignesMOStandalone(prev => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  /* ─ Calcul durée totale ─ */
  const dureeTotale =
    lignesTravaux.reduce((acc, l) => acc + (l.moLiee?.dureeMinutes || 0), 0) +
    lignesMOStandalone.reduce((acc, l) => acc + (l.dureeMinutes || 0), 0)

  /* ─ Soumission ─ */
  const handleSave = () => {
    const travailVide = lignesTravaux.some(l => !l.designation.trim())
    const moVideLiee = lignesTravaux.some(
      l => l.moLiee && !l.moLiee.typeIntervention.trim(),
    )
    const moVideStandalone = lignesMOStandalone.some(l => !l.typeIntervention.trim())

    if (travailVide) { alert('Veuillez remplir toutes les désignations de pièces.'); return }
    if (moVideLiee) { alert('Veuillez remplir le type d\'intervention des MO liées.'); return }
    if (moVideStandalone) { alert('Veuillez remplir le type d\'intervention des opérations MO autonomes.'); return }

    const payload = {
      demandeId,
      lignesTravaux: lignesTravaux.map(l => ({
        designation: l.designation,
        quantite: l.quantite,
        mainOeuvreAssociee: l.moLiee
          ? {
              typeIntervention: l.moLiee.typeIntervention,
              dureeMinutes: l.moLiee.dureeMinutes,
            }
          : null,
      })),
      lignesMainOeuvre: lignesMOStandalone.map(l => ({
        typeIntervention: l.typeIntervention,
        dureeMinutes: l.dureeMinutes,
      })),
    }
    mutation.mutate(payload)
  }

  if (isLoading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Chargement du dossier...</div>

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: '#64748b',
          cursor: 'pointer', marginBottom: 30, fontWeight: 700, fontSize: '0.85rem',
        }}
      >
        <ArrowLeft size={18} /> RETOUR
      </button>

      <div style={{
        background: '#fff', borderRadius: 28, padding: '40px 44px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              🔬 Diagnostic Technique — V1
            </h1>
            <p style={{ color: '#64748b', marginTop: 6, margin: 0 }}>
              Dossier <strong style={{ color: '#1e293b' }}>{demande?.reference}</strong> — définissez pièces et main d'œuvre sans prix.
            </p>
          </div>
          <div style={{
            background: '#fef3c7', color: '#92400e', padding: '10px 18px',
            borderRadius: 12, fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap',
          }}>
            VERSION TECHNIQUE
          </div>
        </div>

        {/* Rappel problème */}
        {demande && (
          <div style={{
            background: '#eff6ff', padding: 22, borderRadius: 18, marginBottom: 40,
            borderLeft: '5px solid #3b82f6', display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <AlertCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e40af', lineHeight: 1.65 }}>
              {demande.descriptionProbleme}
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION PIÈCES + MO ASSOCIÉE
        ══════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{
              margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Wrench size={20} color="#3b82f6" />
              Pièces &amp; fournitures
              <span style={{
                background: '#eff6ff', color: '#3b82f6',
                fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 8,
              }}>
                + MO liée possible
              </span>
            </h3>
            <button
              onClick={() => setLignesTravaux(prev => [
                ...prev,
                { uid: Date.now(), designation: '', quantite: 1, moLiee: null },
              ])}
              style={{
                background: '#eff6ff', color: '#3b82f6', border: 'none',
                padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Plus size={15} /> Ajouter une pièce
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lignesTravaux.map((l, index) => (
              <div key={l.uid} style={{
                background: l.moLiee ? '#f0fdf4' : '#f8fafc',
                borderRadius: 18, border: `1px solid ${l.moLiee ? '#bbf7d0' : '#e2e8f0'}`,
                overflow: 'hidden', transition: 'all 0.25s',
              }}>
                {/* Ligne pièce */}
                <div style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center' }}>
                  <input
                    placeholder="Désignation (ex : 4 freins avant Brembo, Huile 5W30…)"
                    value={l.designation}
                    onChange={e => updateTravail(index, { designation: e.target.value })}
                    style={{
                      flex: 1, padding: '13px 18px', borderRadius: 12,
                      border: '1px solid #e2e8f0', background: '#fff',
                      fontWeight: 600, fontSize: '0.95rem', outline: 'none',
                    }}
                  />
                  {/* Quantité */}
                  <input
                    type="number"
                    min={1}
                    value={l.quantite}
                    onChange={e => {
                      const v = parseFloat(e.target.value.replace(',', '.'))
                      updateTravail(index, { quantite: isNaN(v) ? 1 : v })
                    }}
                    style={{
                      width: 78, padding: '13px 10px', borderRadius: 12,
                      border: '1px solid #e2e8f0', background: '#fff',
                      fontWeight: 700, textAlign: 'center', outline: 'none',
                    }}
                  />
                  {/* Bouton lier MO */}
                  {!l.moLiee ? (
                    <button
                      onClick={() => addMOLiee(index)}
                      title="Associer une main d'œuvre à cette pièce"
                      style={{
                        background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                      }}
                    >
                      <Link2 size={14} /> + MO
                    </button>
                  ) : (
                    <button
                      onClick={() => removeMOLiee(index)}
                      title="Supprimer la MO liée"
                      style={{
                        background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a',
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <ChevronUp size={14} /> MO
                    </button>
                  )}
                  {/* Supprimer ligne */}
                  <button
                    onClick={() => setLignesTravaux(prev => prev.filter((_, i) => i !== index))}
                    style={{
                      background: '#fff1f2', color: '#e11d48', border: 'none',
                      borderRadius: 12, width: 44, height: 44, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* MO liée — panneau dépliable */}
                {l.moLiee && (
                  <div style={{
                    borderTop: '1px dashed #86efac',
                    padding: '14px 16px', background: '#f0fdf4',
                    display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    <div style={{
                      background: '#16a34a', color: '#fff', borderRadius: 8,
                      width: 28, height: 28, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Link2 size={14} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>
                      MO LIÉE
                    </span>
                    <input
                      placeholder="Type d'intervention (ex : Pose freins avant)"
                      value={l.moLiee.typeIntervention}
                      onChange={e => updateMOLiee(index, { typeIntervention: e.target.value })}
                      style={{
                        flex: 1, padding: '11px 16px', borderRadius: 12,
                        border: '1px solid #86efac', background: '#fff',
                        fontWeight: 600, fontSize: '0.9rem', outline: 'none', color: '#14532d',
                      }}
                    />
                    <DureeInput
                      value={l.moLiee.dureeMinutes}
                      onChange={v => updateMOLiee(index, { dureeMinutes: v })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION MO AUTONOMES (sans pièce associée)
        ══════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{
              margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <ClipboardList size={20} color="#8b5cf6" />
              Opérations MO autonomes
              <span style={{
                background: '#f5f3ff', color: '#7c3aed',
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 8,
              }}>
                sans pièce associée
              </span>
            </h3>
            <button
              onClick={() => setLignesMOStandalone(prev => [
                ...prev,
                { uid: Date.now(), typeIntervention: '', dureeMinutes: 60 },
              ])}
              style={{
                background: '#f5f3ff', color: '#7c3aed', border: 'none',
                padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Plus size={15} /> Ajouter une opération
            </button>
          </div>

          {lignesMOStandalone.length === 0 && (
            <div style={{
              padding: '20px', borderRadius: 14, border: '1px dashed #e2e8f0',
              textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600,
            }}>
              Aucune opération autonome — utilisez la section "Pièces" ci-dessus pour les MO liées.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lignesMOStandalone.map((l, index) => (
              <div key={l.uid} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  placeholder="Type d'intervention (ex : Vidange moteur, Diagnostic électronique…)"
                  value={l.typeIntervention}
                  onChange={e => updateMOStandalone(index, { typeIntervention: e.target.value })}
                  style={{
                    flex: 1, padding: '13px 18px', borderRadius: 12,
                    border: '1px solid #e2e8f0', background: '#f8fafc',
                    fontWeight: 600, fontSize: '0.95rem', outline: 'none',
                  }}
                />
                <DureeInput
                  value={l.dureeMinutes}
                  onChange={v => updateMOStandalone(index, { dureeMinutes: v })}
                />
                <button
                  onClick={() => setLignesMOStandalone(prev => prev.filter((_, i) => i !== index))}
                  style={{
                    background: '#fff1f2', color: '#e11d48', border: 'none',
                    borderRadius: 12, width: 44, height: 44, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Récap durée totale */}
        <div style={{
          background: '#1e293b', borderRadius: 18, padding: '20px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 36,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={22} color="#94a3b8" />
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.9rem' }}>
              Durée totale estimée
            </span>
          </div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>
            {formatDuree(dureeTotale)}
          </span>
        </div>

        {/* Bouton submit */}
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          style={{
            width: '100%', padding: '20px',
            background: mutation.isPending ? '#94a3b8' : '#0f172a',
            color: '#fff', border: 'none', borderRadius: 18,
            fontSize: '1rem', fontWeight: 800, cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '0 8px 20px rgba(15,23,42,0.18)', transition: 'background 0.2s',
          }}
        >
          {mutation.isPending
            ? 'Enregistrement...'
            : <><Send size={18} /> TRANSMETTRE À LA RÉCEPTIONNISTE</>}
        </button>
      </div>
    </div>
  )
}
