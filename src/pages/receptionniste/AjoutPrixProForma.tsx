import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  DollarSign, 
  Save, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Calculator,
  Send,
  Info,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ChevronLeft
} from 'lucide-react'
import axiosInstance from '../../utils/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import gsap from 'gsap'

export default function AjoutPrixProForma() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const containerRef = useRef(null)
  
  const [fraisDiag, setFraisDiag] = useState(0)
  const [fraisRecup, setFraisRecup] = useState(0)
  const [fraisLivraison, setFraisLivraison] = useState(0)
  const [prices, setPrices] = useState<{ [key: number]: number }>({})
  const [moPrices, setMoPrices] = useState<{ [key: number]: number }>({})

  const { data: pf, isLoading } = useQuery({
    queryKey: ['proforma-admin', id],
    queryFn: () => axiosInstance.get(`/api/v1/proformas/${id}/receptionniste`).then(res => res.data)
  })

  useEffect(() => {
    if (pf) {
        setFraisDiag(prev => prev || pf.fraisDiagnostic || 25000)
        setFraisRecup(prev => prev || pf.fraisRecuperation || 0)
        setFraisLivraison(prev => prev || pf.fraisLivraison || 0)
        
        setPrices(prev => {
            if (Object.keys(prev).length > 0) return prev
            const initial: any = {}
            pf.lignesTravaux.forEach((l: any) => { if(l.prixUnitaire) initial[l.id] = l.prixUnitaire })
            return initial
        })

        setMoPrices(prev => {
            if (Object.keys(prev).length > 0) return prev
            const initial: any = {}
            pf.lignesMainOeuvre.forEach((l: any) => { if(l.tauxHoraire) initial[l.id] = l.tauxHoraire })
            return initial
        })
    }
  }, [pf])

  useEffect(() => {
    if (!isLoading && pf) {
      gsap.from('.premium-entry', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      })
    }
  }, [isLoading, pf])

  const mutation = useMutation({
    mutationFn: (payload: any) => axiosInstance.put(`/api/v1/proformas/${id}/prix`, payload),
    onSuccess: () => {
        axiosInstance.put(`/api/v1/proformas/${id}/envoyer-client`).then(() => {
            alert("Prix enregistrés et Pro Forma envoyé au client !")
            queryClient.invalidateQueries()
            navigate('/admin/reception/dashboard')
        })
    }
  })

  const calculateTotal = () => {
    let total = (fraisDiag || 0) + (fraisRecup || 0)
    pf?.lignesTravaux?.forEach((l: any) => {
        const p = prices[l.id] || 0
        const qty = l.quantite || 0
        total += (p * qty)
    })
    pf?.lignesMainOeuvre?.forEach((l: any) => {
        const rate = moPrices[l.id] || 0
        const hours = l.heures || 0
        total += (rate * hours)
    })
    return total
  }

  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="loader-premium"></div>
    </div>
  )

  const handleSave = () => {
    const payload = {
        fraisDiagnostic: fraisDiag,
        fraisRecuperation: fraisRecup,
        lignesTravaux: pf.lignesTravaux.map((l: any) => ({ ligneId: l.id, prixUnitaire: prices[l.id] || 0 })),
        lignesMainOeuvre: pf.lignesMainOeuvre.map((l: any) => ({ ligneId: l.id, tauxHoraire: moPrices[l.id] || 0 }))
    }
    mutation.mutate(payload)
  }

  return (
    <div ref={containerRef} style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="back-button-premium premium-entry"
      >
        <ArrowLeft size={18} /> RETOUR AU TABLEAU DE BORD
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }} className="responsive-grid">
        {/* Main Content */}
        <div className="glass-card-main premium-entry">
            <div style={{ marginBottom: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 10 }}>
                  <span className="badge-ref">#{pf?.reference}</span>
                  <span className="badge-statut">{pf?.statut.replace(/_/g, ' ')}</span>
                </div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>Tarification Professionnelle</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: 10 }}>
                  Client : <strong style={{ color: '#0f172a' }}>{pf?.clientNom}</strong> • 
                  Véhicule : <strong style={{ color: '#0f172a' }}>{pf?.vehiculeMarque} {pf?.vehiculeModele}</strong>
                </p>
            </div>

            {/* Frais Logistiques */}
            <section style={{ marginBottom: 50 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 25 }}>
                <div className="icon-circle" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Truck size={22} /></div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Logistique & Diagnostic</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                  <div className="fee-input-card">
                      <label>Frais de Diagnostic</label>
                      <div className="input-group-premium">
                          <input type="number" value={fraisDiag !== undefined ? fraisDiag : ''} onChange={e => setFraisDiag(e.target.value === '' ? 0 : Number(e.target.value))} />
                          <span className="currency-label">FCFA</span>
                      </div>
                  </div>
                  <div className="fee-input-card highlight-orange">
                      <label>Récupération Véhicule</label>
                      <div className="input-group-premium">
                          <input type="number" value={fraisRecup !== undefined ? fraisRecup : ''} onChange={e => setFraisRecup(e.target.value === '' ? 0 : Number(e.target.value))} />
                          <span className="currency-label">FCFA</span>
                      </div>
                  </div>
                  <div className="fee-input-card highlight-green" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                      <label>Livraison Client</label>
                      <div style={{ padding: '12px 0', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                        À fixer après confirmation du client (si livraison demandée)
                      </div>
                  </div>
              </div>
            </section>

            {/* Table des Travaux */}
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                <div className="icon-circle" style={{ background: '#eff6ff', color: '#3b82f6' }}><ShieldCheck size={20} /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Pièces & Consommables</h3>
              </div>
              <div className="table-container-premium" style={{ background: '#fff', borderRadius: 24, padding: 20, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                      <colgroup>
                          <col style={{ width: '35%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '25%' }} />
                          <col style={{ width: '20%' }} />
                      </colgroup>
                      <thead>
                          <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>DÉSIGNATION DU PRODUIT</th>
                              <th style={{ padding: '20px 15px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>MARGE CONSEILLÉE</th>
                              <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' }}>PRIX UNITAIRE HT</th>
                              <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL HT</th>
                          </tr>
                      </thead>
                      <tbody>
                          {pf?.lignesTravaux.map((l: any) => {
                              const linePrice = prices[l.id] || 0;
                              const lineTotal = linePrice * (l.quantite || 0);
                              return (
                                <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '20px 15px' }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{l.designation}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                                            Quantité : <strong style={{ color: '#3b82f6' }}>{l.quantite}</strong>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'center' }}>
                                        {l.prixMinConseille ? (
                                            <div className="range-badge" style={{ display: 'inline-block' }}>
                                                {l.prixMinConseille.toLocaleString()} — {l.prixMaxConseille.toLocaleString()} F
                                            </div>
                                        ) : <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Non référencé</span>}
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'right', background: '#f8fafc' }}>
                                        <div className="input-group-premium compact">
                                            <input 
                                                type="number" 
                                                value={prices[l.id] !== undefined ? prices[l.id] : ''} 
                                                onChange={e => setPrices({...prices, [l.id]: e.target.value === '' ? undefined : Number(e.target.value)})}
                                                placeholder="0"
                                                style={{ textAlign: 'right', width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '1.1rem' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#94a3b8' }}>F</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{lineTotal.toLocaleString()} F</div>
                                    </td>
                                </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
            </section>

            {/* Main d'Oeuvre */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                <div className="icon-circle" style={{ background: '#fef2f2', color: '#ef4444' }}><Wrench size={20} /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Main d'Œuvre Technique</h3>
              </div>
              <div className="table-container-premium" style={{ background: '#fff', borderRadius: 24, padding: 20, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                      <colgroup>
                          <col style={{ width: '35%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '25%' }} />
                          <col style={{ width: '20%' }} />
                      </colgroup>
                      <thead>
                          <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                              <th style={{ padding: '20px 15px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>OPÉRATION TECHNIQUE</th>
                              <th style={{ padding: '20px 15px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>TEMPS ESTIMÉ</th>
                              <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', background: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' }}>TAUX HORAIRE HT</th>
                              <th style={{ padding: '20px 15px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL HT</th>
                          </tr>
                      </thead>
                      <tbody>
                          {pf?.lignesMainOeuvre.map((l: any) => {
                              const rate = moPrices[l.id] || 0;
                              const lineTotal = rate * (l.heures || 0);
                              return (
                                <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '20px 15px' }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{l.typeIntervention}</div>
                                        {l.commentaireTechnicien && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{l.commentaireTechnicien}</div>}
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'center' }}>
                                        <span className="time-badge">{l.heures} H</span>
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'right', background: '#f8fafc' }}>
                                        <div className="input-group-premium compact">
                                            <input 
                                                type="number" 
                                                value={moPrices[l.id] !== undefined ? moPrices[l.id] : ''} 
                                                onChange={e => setMoPrices({...moPrices, [l.id]: e.target.value === '' ? undefined : Number(e.target.value)})}
                                                placeholder="0"
                                                style={{ textAlign: 'right', width: '100%', border: 'none', background: 'transparent', outline: 'none', fontWeight: 800, fontSize: '1.1rem' }}
                                            />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#94a3b8' }}>F</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 15px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{lineTotal.toLocaleString()} F</div>
                                    </td>
                                </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
            </section>
        </div>

        {/* Sidebar Summary */}
        <div style={{ position: 'sticky', top: 40, height: 'fit-content' }} className="premium-entry">
            <div className="summary-sidebar-premium">
                <h4 className="summary-title">
                    <Calculator size={22} color="#fff" /> RÉCAPITULATIF FINANCIER
                </h4>
                
                <div className="summary-details">
                    <div className="summary-item"><span>Diagnostic & SAV</span> <span>{fraisDiag.toLocaleString()} F</span></div>
                    <div className="summary-item"><span>Récupération véhicule</span> <span>{fraisRecup.toLocaleString()} F</span></div>
                    <div className="summary-item muted"><span>Livraison (fixé après sélection client)</span> <span>—</span></div>
                    <div className="summary-item muted"><span>Pièces & Consommables</span> <span>Calcul auto...</span></div>
                </div>

                <div className="total-block-premium">
                    <div className="total-label">MONTANT TOTAL ESTIMÉ (HT)</div>
                    <div className="total-value">{calculateTotal().toLocaleString()} <small>FCFA</small></div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="submit-btn-premium"
                >
                    {mutation.isPending ? (
                      <div className="loader-small"></div>
                    ) : (
                      <><Send size={20} /> ENVOYER AU CLIENT</>
                    )}
                </button>

                <div className="info-box-premium">
                    <Info size={16} />
                    <p>L'envoi notifiera le client via son application mobile et par email pour validation de la Pro Forma.</p>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .loader-premium { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .back-button-premium { 
          display: flex; alignItems: center; gap: 10px; background: #fff; border: 1px solid #e2e8f0; 
          padding: 12px 20px; border-radius: 14px; color: #64748b; font-weight: 800; font-size: 0.85rem;
          cursor: pointer; margin-bottom: 40px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .back-button-premium:hover { background: #f1f5f9; color: #1e293b; transform: translateX(-5px); }

        .glass-card-main { 
          background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); 
          border-radius: 35px; padding: 50px; border: 1px solid #ffffff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
        }

        .badge-ref { background: #0f172a; color: #fff; padding: 6px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 900; }
        .badge-statut { background: #eff6ff; color: #3b82f6; padding: 6px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; }

        .icon-circle { width: 44px; height: 44px; border-radius: 14px; display: flex; alignItems: center; justifyContent: center; }

        .fee-input-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 20px; transition: all 0.3s; }
        .fee-input-card:focus-within { border-color: #3b82f6; background: #fff; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.05); }
        .fee-input-card label { display: block; font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; }
        
        .fee-input-card.highlight-orange { background: #fffaf5; border-color: #fed7aa; }
        .fee-input-card.highlight-green { background: #f7fee7; border-color: #d9f99d; }

        .input-group-premium { 
          display: flex; align-items: center; gap: 10px; background: #ffffff; 
          border: 2px solid #cbd5e1; border-radius: 14px; padding: 0 15px;
          transition: all 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          white-space: nowrap;
        }
        .input-group-premium:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .input-group-premium input { 
            width: 100%; border: none; background: transparent; 
            font-size: 1.2rem; font-weight: 900; color: #0f172a; 
            outline: none; padding: 15px 0; min-width: 80px;
        }
        .currency-label { font-size: 0.75rem; font-weight: 900; color: #64748b; }

        .input-group-premium.compact { padding: 0 10px; border-radius: 12px; background: #ffffff; border: 2px solid #e2e8f0; width: 100%; }
        .input-group-premium.compact input { font-size: 1rem; padding: 10px 0; }
        .input-group-premium.compact:hover { border-color: #3b82f6; }
        .input-group-premium.compact:focus-within { border-color: #3b82f6; background: #fff; }

        .editable-hint { position: relative; }
        .editable-hint:focus-within::after { opacity: 0; }

        .table-header th { font-size: 0.7rem; font-weight: 900; color: #94a3b8; text-align: left; letter-spacing: 1px; }
        .table-container-premium { overflow-x: auto; padding-bottom: 10px; }
        .table-row-premium { background: #f8fafc; transition: all 0.2s; }
        .table-row-premium:hover { background: #fff; transform: scale(1.01); box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
        .table-row-premium td:first-child { border-radius: 16px 0 0 16px; }
        .table-row-premium td:last-child { border-radius: 0 16px 16px 0; }

        .range-badge { background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; display: inline-block; }
        .time-badge { background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 800; }

        .summary-sidebar-premium { 
          background: #0f172a; border-radius: 30px; padding: 40px; color: #fff;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.3);
        }
        .summary-title { margin: 0 0 35px; display: flex; align-items: center; gap: 12px; font-size: 1.2rem; font-weight: 900; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
        .summary-item { display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; margin-bottom: 20px; }
        .summary-item.muted { color: #64748b; font-style: italic; }

        .total-block-premium { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 25px; border-radius: 20px; margin-bottom: 35px; }
        .total-label { font-size: 0.7rem; font-weight: 800; color: #3b82f6; margin-bottom: 8px; letter-spacing: 1px; }
        .total-value { font-size: 2.2rem; font-weight: 900; color: #fff; }
        .total-value small { font-size: 1rem; color: #3b82f6; }

        .submit-btn-premium { 
          width: 100%; padding: 22px; background: #3b82f6; color: #fff; border: none; border-radius: 20px; 
          font-size: 1rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.3s ease; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }
        .submit-btn-premium:hover:not(:disabled) { background: #2563eb; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.5); }
        .submit-btn-premium:disabled { opacity: 0.7; cursor: not-allowed; }

        .info-box-premium { display: flex; gap: 12px; margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 16px; color: #64748b; font-size: 0.8rem; line-height: 1.5; }

        @media (max-width: 1024px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
