import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  ArrowLeft,
  Tag,
  X
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import ChatComposant from '../../components/chat/ChatComposant'

export default function ProFormaClientPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedLines, setSelectedLines] = useState<{ [key: number]: boolean }>({})
  const [demandeLivraison, setDemandeLivraison] = useState(false)
  const [adresseLivraison, setAdresseLivraison] = useState('')

  // Coupon
  const [couponInput, setCouponInput] = useState('')
  const [couponPreview, setCouponPreview] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const { data: pf, isLoading } = useQuery({
    queryKey: ['proforma-client', id],
    queryFn: () => axiosInstance.get(`/api/v1/proformas/${id}/client`).then(res => res.data)
  })

  useEffect(() => {
    if (pf) {
      const initial: { [key: number]: boolean } = {}
      pf.lignesTravaux.forEach((l: any) => initial[l.id] = l.cocheeParClient)
      pf.lignesMainOeuvre.forEach((l: any) => initial[l.id] = l.cocheeParClient)
      setSelectedLines(initial)
      setDemandeLivraison(pf.demandeLivraison || false)
      setAdresseLivraison(pf.adresseLivraison || '')
    }
  }, [pf])

  const mutationSelection = useMutation({
    mutationFn: (newSelection: any) => axiosInstance.put(`/api/v1/proformas/${id}/selection`, newSelection),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proforma-client', id] })
  })

  const mutationConfirmer = useMutation({
    mutationFn: () => axiosInstance.put(`/api/v1/proformas/${id}/confirmer`),
    onSuccess: () => {
        alert("Votre commande est confirmée ! Nos techniciens commencent les travaux.")
        queryClient.invalidateQueries({ queryKey: ['proforma-client', id] })
        navigate('/mon-espace')
    }
  })

  // Vérifier coupon (sans appliquer)
  const mutationVerifierCoupon = useMutation({
    mutationFn: (code: string) =>
      axiosInstance.get(`/api/v1/coupons/${code}/verifier?proFormaId=${pf?.id}`).then(r => r.data),
    onSuccess: (data: any) => { setCouponPreview(data); setCouponError('') },
    onError: (err: any) => { setCouponPreview(null); setCouponError(err?.response?.data?.message || 'Coupon invalide.') },
  })

  // Appliquer coupon
  const mutationAppliquerCoupon = useMutation({
    mutationFn: () => axiosInstance.post('/api/v1/coupons/appliquer', { proFormaId: pf?.id, code: couponInput.toUpperCase() }),
    onSuccess: () => {
      setCouponApplied(true)
      setCouponPreview(null)
      queryClient.invalidateQueries({ queryKey: ['proforma-client', id] })
    },
    onError: (err: any) => setCouponError(err?.response?.data?.message || 'Erreur lors de l\'application.'),
  })

  const mutationConfirmerFinal = useMutation({
    mutationFn: () => axiosInstance.put(`/api/v1/proformas/${id}/confirmer-final`),
    onSuccess: () => {
        alert("Confirmation finale envoyée ! Vos travaux vont débuter.")
        queryClient.invalidateQueries({ queryKey: ['proforma-client', id] })
        navigate('/mon-espace')
    }
  })

  const toggleLine = (lineId: number, type: 'travaux' | 'mo') => {
    const newValue = !selectedLines[lineId]
    const updated = { ...selectedLines, [lineId]: newValue }

    // Si on décoche une PIÈCE, décocher automatiquement toutes les MO liées à cette pièce.
    // Si on recoche une PIÈCE, recocher les MO liées aussi.
    if (type === 'travaux') {
      pf.lignesMainOeuvre.forEach((mo: any) => {
        if (mo.ligneTravailId === lineId) {
          updated[mo.id] = newValue
        }
      })
    }

    setSelectedLines(updated)

    const payload = {
      lignesTravaux: pf.lignesTravaux.map((l: any) => ({ ligneId: l.id, cochee: updated[l.id] })),
      lignesMainOeuvre: pf.lignesMainOeuvre.map((l: any) => ({ ligneId: l.id, cochee: updated[l.id] })),
      demandeLivraison,
      adresseLivraison,
    }
    mutationSelection.mutate(payload)
  }

  const handleLivraisonChange = (checked: boolean) => {
    setDemandeLivraison(checked)
    const payload = {
        lignesTravaux: pf.lignesTravaux.map((l: any) => ({ ligneId: l.id, cochee: selectedLines[l.id] })),
        lignesMainOeuvre: pf.lignesMainOeuvre.map((l: any) => ({ ligneId: l.id, cochee: selectedLines[l.id] })),
        demandeLivraison: checked,
        adresseLivraison
    }
    mutationSelection.mutate(payload)
  }

  if (isLoading) return <div className="p-20 text-center">Chargement de votre devis...</div>

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-TG', { style: 'currency', currency: 'XOF' }).format(p).replace('XOF', 'FCFA')

  const isConfirmed = ['CONFIRME_CLIENT', 'CONFIRME', 'PROFORMA_VALIDE', 'EN_COURS_REPARATION', 'PRET', 'EN_LIVRAISON', 'CLOTURE'].includes(pf?.statut)
  const isAwaitingFinalConfirmation = pf?.demandeStatut === 'EN_ATTENTE_CONFIRMATION_FINALE'

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '120px 24px 60px', background: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
        
        {/* Main Section */}
        <div>
            <div style={{ background: '#fff', borderRadius: 32, padding: 40, boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>🧾 Devis Pro Forma</h1>
                        <p style={{ color: '#64748b', marginTop: 8, fontSize: '1.1rem' }}>Référence: <strong>{pf?.reference}</strong></p>
                    </div>
                    <div style={{
                        padding: '12px 24px', borderRadius: 16, fontSize: '0.85rem', fontWeight: 800,
                        background: isConfirmed ? '#f0fdf4' : isAwaitingFinalConfirmation ? '#fffbeb' : '#fff7ed',
                        color: isConfirmed ? '#166534' : isAwaitingFinalConfirmation ? '#92400e' : '#9a3412',
                        border: `1px solid ${isConfirmed ? '#bbf7d0' : isAwaitingFinalConfirmation ? '#fde68a' : '#fed7aa'}`,
                        textTransform: 'uppercase'
                    }}>
                        {isConfirmed ? 'Commande confirmée' : isAwaitingFinalConfirmation ? 'Confirmation finale requise' : 'En attente de validation'}
                    </div>
                </div>

                <div style={{ background: '#f1f5f9', padding: 25, borderRadius: 20, marginBottom: 40, display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ background: '#3b82f6', color: '#fff', width: 50, height: 50, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Info size={24} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>
                        Veuillez cocher les travaux que vous souhaitez valider. Les frais de diagnostic et de récupération sont obligatoires.
                    </p>
                </div>

                {/* TABLEAU DES TRAVAUX */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={20} color="#3b82f6" /> Pièces & Main d'œuvre
                </h3>
                
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', marginBottom: 40 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                                <th style={{ padding: '15px 20px', width: 60 }}>Accord</th>
                                <th style={{ padding: 15 }}>Désignation / Intervention</th>
                                <th style={{ padding: 15, textAlign: 'right' }}>Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Pièces + leur MO liée éventuelle (affichée juste dessous) */}
                            {pf?.lignesTravaux.map((l: any) => {
                              const moLiee = pf.lignesMainOeuvre.find((mo: any) => mo.ligneTravailId === l.id)
                              const pieceChecked = selectedLines[l.id] || false
                              return (
                                <React.Fragment key={l.id}>
                                  {/* Ligne pièce */}
                                  <tr style={{ borderTop: '1px solid #f1f5f9', opacity: pieceChecked ? 1 : 0.4 }}>
                                      <td style={{ padding: '18px 20px' }}>
                                          <input
                                              type="checkbox"
                                              checked={pieceChecked}
                                              onChange={() => toggleLine(l.id, 'travaux')}
                                              disabled={isConfirmed || isAwaitingFinalConfirmation}
                                              className="custom-checkbox"
                                          />
                                      </td>
                                      <td style={{ padding: '18px 20px' }}>
                                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{l.designation}</div>
                                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pièce — Quantité: {l.quantite}</div>
                                      </td>
                                      <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                          {formatPrice(l.prixTotal)}
                                      </td>
                                  </tr>
                                  {/* MO liée — sous-ligne indentée, coché/décoché automatiquement */}
                                  {moLiee && (
                                    <tr style={{
                                      background: pieceChecked ? '#f0fdf4' : '#f9fafb',
                                      opacity: (selectedLines[moLiee.id] ?? true) ? 1 : 0.4,
                                      borderBottom: '1px solid #e2e8f0',
                                    }}>
                                      <td style={{ padding: '10px 20px' }}>
                                        {/* Checkbox désactivée — pilotée par la pièce */}
                                        <input
                                          type="checkbox"
                                          checked={selectedLines[moLiee.id] || false}
                                          disabled
                                          className="custom-checkbox"
                                          style={{ opacity: 0.5 }}
                                        />
                                      </td>
                                      <td style={{ padding: '10px 20px 10px 36px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <span style={{
                                            background: '#dcfce7', color: '#16a34a', fontSize: '0.65rem',
                                            fontWeight: 800, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap',
                                          }}>↳ MO LIÉE</span>
                                          <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                                            {moLiee.typeIntervention}
                                          </span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 3, marginLeft: 0 }}>
                                          Temps: {moLiee.dureeMinutes ? `${moLiee.dureeMinutes} min` : `${moLiee.heures || 0}h`}
                                          &nbsp;·&nbsp;annulé automatiquement si la pièce est décochée
                                        </div>
                                      </td>
                                      <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: '#374151', fontSize: '0.9rem' }}>
                                        {formatPrice(moLiee.total || 0)}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              )
                            })}
                            {/* MO autonomes (non liées à une pièce) */}
                            {pf?.lignesMainOeuvre.filter((mo: any) => !mo.ligneTravailId).map((l: any) => (
                                <tr key={l.id} style={{ borderTop: '1px solid #f1f5f9', opacity: selectedLines[l.id] ? 1 : 0.4 }}>
                                    <td style={{ padding: '18px 20px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLines[l.id] || false}
                                            onChange={() => toggleLine(l.id, 'mo')}
                                            disabled={isConfirmed || isAwaitingFinalConfirmation}
                                            className="custom-checkbox"
                                        />
                                    </td>
                                    <td style={{ padding: '18px 20px' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{l.typeIntervention}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                          Temps estimé: {l.dureeMinutes ? `${l.dureeMinutes} min` : `${l.heures || 0}h`}
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                        {formatPrice(l.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* LOGISTIQUE RETOUR */}
                <div style={{ 
                    background: demandeLivraison ? '#f0fdf4' : '#f8fafc', 
                    borderRadius: 24, padding: 30, border: `1px solid ${demandeLivraison ? '#bbf7d0' : '#e2e8f0'}`,
                    transition: 'all 0.3s'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ 
                            width: 50, height: 50, borderRadius: 15, background: demandeLivraison ? '#22c55e' : '#cbd5e1', 
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <Truck size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Livraison à domicile</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>Nous vous ramenons votre véhicule après les travaux (+{formatPrice(pf?.fraisLivraison || 0)})</p>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={demandeLivraison} 
                                onChange={e => handleLivraisonChange(e.target.checked)} 
                                disabled={isConfirmed || isAwaitingFinalConfirmation} 
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {demandeLivraison && (
                        <div style={{ marginTop: 25, paddingTop: 25, borderTop: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 800, color: '#166534', marginBottom: 12 }}>
                                <MapPin size={16} /> ADRESSE DE LIVRAISON SOUHAITÉE
                            </label>
                            <input 
                                type="text" 
                                value={adresseLivraison} 
                                onChange={e => setAdresseLivraison(e.target.value)} 
                                onBlur={() => handleLivraisonChange(demandeLivraison)}
                                disabled={isConfirmed || isAwaitingFinalConfirmation}
                                placeholder="Indiquez l'adresse précise (Quartier, Maison...)"
                                style={{ 
                                    width: '100%', padding: '16px 20px', borderRadius: 14, border: '1px solid #bbf7d0', 
                                    background: '#fff', fontSize: '1rem', fontWeight: 600, outline: 'none', color: '#1e293b'
                                }} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Summary */}
        <div style={{ position: 'sticky', top: 120, height: 'fit-content' }}>
            <div style={{ background: '#0f172a', borderRadius: 32, padding: 35, color: '#fff', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)' }}>
                <h3 style={{ margin: '0 0 30px', fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={22} color="#3b82f6" /> RÉCAPITULATIF
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 35 }}>
                    <div className="res-row"><span>Pièces & Travaux</span> <span>{formatPrice(pf?.totalPieces || 0)}</span></div>
                    <div className="res-row"><span>Main d'œuvre</span> <span>{formatPrice(pf?.totalMainOeuvre || 0)}</span></div>
                    
                    <div className="res-row" style={{ color: pf?.diagnosticGratuit ? '#22c55e' : '#fff' }}>
                        <span>Diagnostic {pf?.diagnosticGratuit && '(OFFERT)'}</span> 
                        <span>{formatPrice(pf?.fraisDiagnostic || 0)}</span>
                    </div>

                    {pf?.fraisRecuperation > 0 && (
                        <div className="res-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                Récupération <span style={{ fontSize: '0.65rem', background: '#3b82f6', padding: '2px 6px', borderRadius: 6 }}>OBLIGATOIRE</span>
                            </span> 
                            <span>{formatPrice(pf?.fraisRecuperation)}</span>
                        </div>
                    )}

                    {demandeLivraison && (
                        <div className="res-row" style={{ color: '#22c55e' }}>
                            <span>Livraison à domicile</span> 
                            <span>{formatPrice(pf?.fraisLivraison || 0)}</span>
                        </div>
                    )}
                </div>

                {/* ── Coupon de réduction ── */}
                {!isConfirmed && !isAwaitingFinalConfirmation && (
                  <div style={{ marginBottom: 28 }}>
                    {pf?.couponCode ? (
                      /* Coupon déjà appliqué */
                      <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 800, fontSize: '0.85rem', marginBottom: 6 }}>
                          <Tag size={16} /> Coupon appliqué : {pf.couponCode}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          Remise : -{formatPrice(pf?.montantRemise || 0)}
                        </div>
                      </div>
                    ) : (
                      /* Saisie coupon */
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
                          Code coupon
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponPreview(null); setCouponError('') }}
                            placeholder="EX: DIWA10"
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${couponError ? '#ef4444' : couponPreview ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                              background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                              outline: 'none', fontFamily: 'monospace',
                            }}
                          />
                          <button
                            onClick={() => { if (couponInput.trim()) mutationVerifierCoupon.mutate(couponInput.trim()) }}
                            disabled={!couponInput.trim() || mutationVerifierCoupon.isPending}
                            style={{
                              padding: '10px 14px', borderRadius: 10, border: 'none',
                              background: 'rgba(255,255,255,0.1)', color: '#fff',
                              cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                            }}
                          >
                            Vérifier
                          </button>
                        </div>

                        {/* Erreur */}
                        {couponError && (
                          <div style={{ marginTop: 8, color: '#f87171', fontSize: '0.78rem', fontWeight: 600 }}>
                            ⚠ {couponError}
                          </div>
                        )}

                        {/* Preview coupon valide */}
                        {couponPreview && (
                          <div style={{ marginTop: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: 14 }}>
                            <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.8rem', marginBottom: 4 }}>
                              ✓ Coupon valide — {couponPreview.typeRemise === 'POURCENTAGE' ? `${couponPreview.valeur}%` : `${couponPreview.valeur.toLocaleString()} FCFA`} de remise
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 10 }}>
                              Remise estimée : -{formatPrice(couponPreview.montantRemise || 0)}<br />
                              Total après remise : <strong style={{ color: '#fff' }}>{formatPrice(couponPreview.totalApresRemise || 0)}</strong>
                            </div>
                            <button
                              onClick={() => mutationAppliquerCoupon.mutate()}
                              disabled={mutationAppliquerCoupon.isPending}
                              style={{
                                width: '100%', padding: '10px', background: '#22c55e',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                              }}
                            >
                              {mutationAppliquerCoupon.isPending ? 'Application...' : 'Appliquer ce coupon'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 25, marginBottom: 40 }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>Total Net à payer HT</div>
                    {pf?.montantRemise > 0 ? (
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'line-through', marginTop: 5 }}>
                          {formatPrice(pf?.totalGeneral || 0)}
                        </div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#22c55e', marginTop: 2 }}>
                          {formatPrice(pf?.totalApresRemise || 0)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                          Remise : -{formatPrice(pf?.montantRemise || 0)} ({pf?.couponCode})
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginTop: 5 }}>{formatPrice(pf?.totalGeneral || 0)}</div>
                    )}
                </div>

                {isAwaitingFinalConfirmation ? (
                    <div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '20px', borderRadius: 20, marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b', fontWeight: 800, marginBottom: 10 }}>
                                <Truck size={22} /> Frais de livraison ajoutés
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                La réception a fixé les frais de livraison à domicile.
                                Votre nouveau total est affiché ci-dessus.
                            </div>
                        </div>
                        <button
                            onClick={() => mutationConfirmerFinal.mutate()}
                            disabled={mutationConfirmerFinal.isPending}
                            style={{
                                width: '100%', padding: '22px', background: '#22c55e', color: '#fff',
                                border: 'none', borderRadius: 20, fontSize: '1.1rem', fontWeight: 800,
                                cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.3)',
                                marginBottom: 12
                            }}
                        >
                            {mutationConfirmerFinal.isPending ? 'Confirmation...' : 'J\'ACCEPTE LE DEVIS FINAL'}
                        </button>
                        <button
                            onClick={() => navigate('/mon-espace')}
                            style={{
                                width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 16,
                                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Revenir plus tard
                        </button>
                    </div>
                ) : !isConfirmed ? (
                    <button
                        onClick={() => mutationConfirmer.mutate()}
                        disabled={mutationConfirmer.isPending || (demandeLivraison && !adresseLivraison.trim())}
                        style={{
                            width: '100%', padding: '22px', background: '#3b82f6', color: '#fff',
                            border: 'none', borderRadius: 20, fontSize: '1.1rem', fontWeight: 800,
                            cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        {mutationConfirmer.isPending ? 'Confirmation...' : 'CONFIRMER & VALIDER'}
                    </button>
                ) : (
                    <div style={{ textAlign: 'center', color: '#22c55e' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: 20, marginBottom: 15 }}>
                            <CheckCircle size={40} style={{ margin: '0 auto 10px' }} />
                            <div style={{ fontWeight: 800 }}>COMMANDE CONFIRMÉE</div>
                        </div>
                        {pf?.pdfUrlClient && (
                            <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:8181'}/uploads/${pf.pdfUrlClient}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#3b82f6', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
                                <Download size={18} /> Télécharger ma facture
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 20 }}>
                {pf?.demandeId && <ChatComposant demandeId={pf.demandeId} />}
            </div>
        </div>
      </div>

      <style>{`
        .custom-checkbox { width: 22px; height: 22px; cursor: pointer; accent-color: #3b82f6; }
        .res-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 0.95rem; }
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: #22c55e; }
        input:checked + .slider:before { transform: translateX(24px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>
    </div>
  )
}
