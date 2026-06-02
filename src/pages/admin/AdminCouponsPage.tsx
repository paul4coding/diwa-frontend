import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, CheckCircle, XCircle, Clock, Users, RefreshCw } from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { formatMontant, badgeStatut } from '../../utils/couponUtils'

interface Coupon {
  id: number
  code: string
  description: string
  valeur: number
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  nbMaxUtilisations: number
  nbUtilisations: number
  dateExpiration: string | null
  actif: boolean
  expire: boolean
  epuise: boolean
  valide: boolean
  proFormaId: number | null
  createurNom: string
}

export default function AdminCouponsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    code: '', description: '', valeur: '', typeRemise: 'POURCENTAGE',
    nbMaxUtilisations: 1, dateExpiration: '', proFormaId: '',
  })

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: () => axiosInstance.get('/api/v1/coupons').then(r => r.data),
  })

  const mutationCreer = useMutation({
    mutationFn: (payload: any) => axiosInstance.post('/api/v1/coupons', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setShowModal(false); resetForm() },
  })

  const mutationDesactiver = useMutation({
    mutationFn: (id: number) => axiosInstance.patch(`/api/v1/coupons/${id}/desactiver`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  })

  const resetForm = () => setForm({ code: '', description: '', valeur: '', typeRemise: 'POURCENTAGE', nbMaxUtilisations: 1, dateExpiration: '', proFormaId: '' })

  const handleSubmit = () => {
    if (!form.code || !form.valeur) { alert('Code et valeur sont obligatoires.'); return }
    mutationCreer.mutate({
      code: form.code.toUpperCase(),
      description: form.description || null,
      valeur: parseFloat(form.valeur),
      typeRemise: form.typeRemise,
      nbMaxUtilisations: form.nbMaxUtilisations,
      dateExpiration: form.dateExpiration || null,
      proFormaId: form.proFormaId ? parseInt(form.proFormaId) : null,
    })
  }

  const actifs = coupons.filter(c => c.valide).length
  const expires = coupons.filter(c => c.expire || c.epuise || !c.actif).length
  const totalUtilisations = coupons.reduce((s, c) => s + c.nbUtilisations, 0)

  return (
    <div style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 900, color: '#0f172a' }}>
            🎟️ Coupons de Réduction
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Créez et gérez les remises accordées aux clients.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '12px 22px', borderRadius: 14, fontWeight: 800,
            fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <Plus size={16} /> Créer un coupon
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
        {[
          { icon: <CheckCircle size={22} color="#16a34a" />, label: 'Coupons actifs', value: actifs, bg: '#f0fdf4', border: '#bbf7d0' },
          { icon: <XCircle size={22} color="#dc2626" />, label: 'Expirés / épuisés', value: expires, bg: '#fef2f2', border: '#fecaca' },
          { icon: <Users size={22} color="#2563eb" />, label: 'Utilisations totales', value: totalUtilisations, bg: '#eff6ff', border: '#bfdbfe' },
        ].map((k, i) => (
          <div key={i} style={{
            background: k.bg, border: `1px solid ${k.border}`,
            borderRadius: 20, padding: '22px 28px',
            display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{ background: '#fff', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: 4 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ textAlign: 'left', fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              {['Code', 'Description', 'Valeur', 'Utilisé / Max', 'Expiration', 'Cible', 'Statut', ''].map((h, i) => (
                <th key={i} style={{ padding: '14px 20px', fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Chargement...</td></tr>
            )}
            {!isLoading && coupons.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Aucun coupon créé.</td></tr>
            )}
            {coupons.map(c => {
              const statut = badgeStatut(c)
              return (
                <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem',
                      background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, color: '#0f172a',
                    }}>{c.code}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.88rem' }}>
                    {c.description || '—'}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a' }}>
                    {formatMontant(c)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 99, maxWidth: 80 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: c.nbUtilisations >= c.nbMaxUtilisations ? '#dc2626' : '#22c55e',
                          width: `${Math.min(100, (c.nbUtilisations / c.nbMaxUtilisations) * 100)}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                        {c.nbUtilisations}/{c.nbMaxUtilisations}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: '#475569' }}>
                    {c.dateExpiration
                      ? new Date(c.dateExpiration).toLocaleDateString('fr-FR')
                      : <span style={{ color: '#94a3b8' }}>Illimité</span>}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#64748b' }}>
                    {c.proFormaId ? `PF #${c.proFormaId}` : 'Global'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      background: statut.bg, color: statut.color,
                      padding: '4px 10px', borderRadius: 8,
                      fontSize: '0.72rem', fontWeight: 800,
                    }}>{statut.label}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {c.actif && (
                      <button
                        onClick={() => { if (confirm(`Désactiver le coupon ${c.code} ?`)) mutationDesactiver.mutate(c.id) }}
                        style={{ background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Désactiver
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal création */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 28, padding: 40, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
            <h2 style={{ margin: '0 0 28px', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
              🎟️ Nouveau coupon
            </h2>

            {[
              { label: 'Code *', field: 'code', placeholder: 'ex: DIWA10', upper: true },
              { label: 'Description', field: 'description', placeholder: 'Remise VIP client fidèle...' },
            ].map(({ label, field, placeholder, upper }) => (
              <div key={field} style={{ marginBottom: 18 }}>
                <label style={labelStyle}>{label}</label>
                <input
                  value={(form as any)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: upper ? e.target.value.toUpperCase() : e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Type de remise *</label>
                <select value={form.typeRemise} onChange={e => setForm(f => ({ ...f, typeRemise: e.target.value }))} style={inputStyle}>
                  <option value="POURCENTAGE">Pourcentage (%)</option>
                  <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Valeur *</label>
                <input
                  type="number" min={0} value={form.valeur}
                  onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                  placeholder={form.typeRemise === 'POURCENTAGE' ? '10' : '5000'}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Nb max utilisations</label>
                <input type="number" min={1} value={form.nbMaxUtilisations}
                  onChange={e => setForm(f => ({ ...f, nbMaxUtilisations: parseInt(e.target.value) || 1 }))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date d'expiration</label>
                <input type="datetime-local" value={form.dateExpiration}
                  onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Lier à un Pro Forma (ID) — optionnel</label>
              <input type="number" value={form.proFormaId}
                onChange={e => setForm(f => ({ ...f, proFormaId: e.target.value }))}
                placeholder="Laisser vide = coupon global"
                style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSubmit}
                disabled={mutationCreer.isPending}
                style={{ flex: 1, padding: '15px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer' }}
              >
                {mutationCreer.isPending ? 'Création...' : 'Créer le coupon'}
              </button>
              <button onClick={() => { setShowModal(false); resetForm() }}
                style={{ padding: '15px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: '0.92rem', fontWeight: 600, outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }
