import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Car, 
  Zap, 
  Plus,
  Save,
  Pencil,
  ArrowLeft,
  Info,
  Share2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Model } from '../../../Model';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import axiosInstance from '../../../utils/axiosInstance';

const BASE_URL = 'http://localhost:8181';

const getImageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('blob:')) return path; // Pour les previews locales
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (!cleanPath.startsWith('uploads/')) {
    return `${BASE_URL}/uploads/${cleanPath}`;
  }
  return `${BASE_URL}/${cleanPath}`;
};

interface AdminVehiculeFormProps {
  vehicule?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminVehiculeForm: React.FC<AdminVehiculeFormProps> = ({ vehicule, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('infos'); // 'infos', 'finitions', 'motorisations', 'options'
  const [vehiculeId, setVehiculeId] = useState<number | null>(vehicule?.id || null);

  const [formData, setFormData] = useState({
    marque: vehicule?.marque || 'MG',
    modele: vehicule?.modele || '',
    annee: vehicule?.annee || new Date().getFullYear(),
    prixBase: vehicule?.prixBase || 0,
    stock: vehicule?.stock || 0,
    description: vehicule?.description || '',
    actif: vehicule?.actif ?? true,
    couleursDispo: vehicule?.couleursDispo || [],
    fichierGlb: vehicule?.fichierGlb || null,
    dossier360: vehicule?.dossier360 || '',
    imagePrincipale: vehicule?.imagePrincipale || null,
    imagesGalerie: vehicule?.imagesGalerie || [],
    ficheTechnique: vehicule?.ficheTechnique || null
  });

  const [uploading, setUploading] = useState({ glb: false, image: false, gallery: false, folder360: false, pdf: false });
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const COLOR_MAPPING: Record<string, string> = {
    '#a32020': 'Red Spinal Mica',
    '#0f0f10': 'Black Mica',
    '#2f4f6f': 'Nautilus Blue',
    '#5a5e60': 'Galena Gray',
    '#c7c9cc': 'Silver Metallic'
  };

  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [newColorFile, setNewColorFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sub-entities state
  const [finitions, setFinitions] = useState<any[]>([]);
  const [motorisations, setMotorisations] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const fetchSubEntities = async () => {
    if (!vehiculeId) return;
    try {
      const [fRes, mRes, oRes] = await Promise.all([
        axiosInstance.get(`/api/v1/finitions/vehicule/${vehiculeId}`),
        axiosInstance.get(`/api/v1/motorisations/vehicule/${vehiculeId}`),
        axiosInstance.get(`/api/v1/options-vehicule/vehicule/${vehiculeId}`)
      ]);
      if (fRes.data.statut === 200) setFinitions(fRes.data.data);
      if (mRes.data.statut === 200) setMotorisations(mRes.data.data);
      if (oRes.data.statut === 200) setOptions(oRes.data.data);
    } catch (err) {
      console.error("Erreur chargement sous-entités:", err);
    }
  };

  useEffect(() => {
    if (vehiculeId) {
      fetchSubEntities();
    }
  }, [vehiculeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value.toLowerCase();
    if (!hex.startsWith('#') && hex.length === 6) hex = '#' + hex;
    setNewColorHex(hex);
    if (COLOR_MAPPING[hex]) {
      setNewColorName(COLOR_MAPPING[hex]);
    } else {
      setNewColorName('');
    }
  };

  const addColorWithImage = async () => {
    if (!newColorHex || !newColorName) {
        setError("Veuillez renseigner le code couleur et le nom.");
        return;
    }
    
    let imageUrl = '';
    
    if (newColorFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', newColorFile);
        try {
            setUploading(prev => ({ ...prev, image: true }));
            const response = await axiosInstance.post('/api/v1/admin/media/vehicule/image', uploadFormData);
            if (response.data.statut === 201) {
                imageUrl = response.data.data.url;
            } else {
                setError("Erreur lors de l'upload de l'image couleur.");
                setUploading(prev => ({ ...prev, image: false }));
                return;
            }
        } catch (err) {
             setError("Erreur réseau lors de l'upload.");
             setUploading(prev => ({ ...prev, image: false }));
             return;
        } finally {
            setUploading(prev => ({ ...prev, image: false }));
        }
    } else {
        setError("Une image est requise pour la couleur.");
        return;
    }

    const colorObj = { hex: newColorHex, name: newColorName, image: imageUrl };
    const colorJson = JSON.stringify(colorObj);
    
    setFormData(prev => {
        const newCouleurs = [...prev.couleursDispo, colorJson];
        const newImagePrincipale = prev.imagePrincipale || imageUrl;
        return {
            ...prev,
            couleursDispo: newCouleurs,
            imagePrincipale: newImagePrincipale
        };
    });
    
    setNewColorHex('#000000');
    setNewColorName('');
    setNewColorFile(null);
  };

  const removeColorObj = (index: number) => {
    setFormData(prev => {
        const newCouleurs = prev.couleursDispo.filter((_, i) => i !== index);
        let newImagePrincipale = prev.imagePrincipale;
        if (index === 0) {
            if (newCouleurs.length > 0) {
                try {
                    const parsed = JSON.parse(newCouleurs[0]);
                    newImagePrincipale = parsed.image;
                } catch(e) {}
            } else {
                newImagePrincipale = null;
            }
        }
        return { ...prev, couleursDispo: newCouleurs, imagePrincipale: newImagePrincipale };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'glb' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      const localUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, imagePrincipale: localUrl }));
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setError(null);

    const endpoint = type === 'glb' ? '/api/v1/admin/media/vehicule/glb' : '/api/v1/admin/media/vehicule/image';
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axiosInstance.post(endpoint, uploadFormData);

      if (response.data.statut === 201) {
        const path = type === 'glb' ? response.data.data.filePath : response.data.data.url;
        setFormData(prev => ({
          ...prev,
          [type === 'glb' ? 'fichierGlb' : 'imagePrincipale']: path
        }));
      } else {
        setError(`Erreur upload (${response.status}) : ${response.data.description || "Echec"}`);
      }
    } catch (err: any) {
      setError(`Erreur réseau : ${err.response?.status || "Inconnu"} - ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, pdf: true }));
    setError(null);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/v1/admin/media/vehicule/pdf', uploadFormData);
      if (response.data.statut === 201) {
        setFormData(prev => ({
          ...prev,
          ficheTechnique: response.data.data.url
        }));
      } else {
        setError("Erreur lors de l'upload de la fiche technique.");
      }
    } catch (err: any) {
      setError(`Erreur réseau : ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Previews locales immédiates
    const localPreviews = Array.from(files).map(f => ({
      url: URL.createObjectURL(f),
      vue: 'INTERIEUR',
      isLocal: true
    }));
    
    setFormData(prev => ({
      ...prev,
      imagesGalerie: [...prev.imagesGalerie, ...localPreviews]
    }));

    setUploading(prev => ({ ...prev, gallery: true }));
    setError(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      try {
        const response = await axiosInstance.post('/api/v1/admin/media/vehicule/image', uploadFormData);
        return response.data.statut === 201 ? response.data.data.url : null;
      } catch { return null; }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const uploadedImages = urls.filter(url => url !== null).map(url => ({
        url,
        vue: 'INTERIEUR'
      }));
      
      setFormData(prev => ({
        ...prev,
        // On remplace les images locales par les images serveur
        imagesGalerie: [...prev.imagesGalerie.filter(img => !img.isLocal), ...uploadedImages]
      }));
    } finally {
      setUploading(prev => ({ ...prev, gallery: false }));
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, folder360: true }));
    setError(null);

    // On utilise le nom du modèle ou de la marque pour nommer le dossier sur le serveur
    const folderName = formData.modele.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'temp_360';
    
    const uploadFormData = new FormData();
    Array.from(files).forEach(file => {
        uploadFormData.append('files', file);
    });
    uploadFormData.append('folderName', folderName);

    try {
      const response = await axiosInstance.post('/api/v1/admin/media/vehicule/360', uploadFormData);

      if (response.data.statut === 201) {
        setFormData(prev => ({
          ...prev,
          dossier360: response.data.data.folderName
        }));
      }
    } catch (err) {
      setError("Erreur lors de l'envoi du dossier 360");
    } finally {
      setUploading(prev => ({ ...prev, folder360: false }));
    }
  };

  const handleDelete360 = async () => {
    if (!formData.dossier360) return;
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement ce dossier 360 ?")) return;

    try {
      await axiosInstance.delete(`/api/v1/admin/media/vehicule/360?folderName=${formData.dossier360}`);
      setFormData(prev => ({ ...prev, dossier360: '' }));
    } catch (err) {
      setError("Erreur lors de la suppression du dossier 360");
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imagesGalerie: prev.imagesGalerie.filter((_, i) => i !== index)
    }));
  };

  const updateGalleryImageVue = (index: number, vue: string) => {
    setFormData(prev => ({
      ...prev,
      imagesGalerie: prev.imagesGalerie.map((img, i) => i === index ? { ...img, vue } : img)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiEndpoint = vehiculeId 
        ? `/api/v1/vehicules/update/${vehiculeId}` 
        : '/api/v1/vehicules/save';
      const method = vehiculeId ? 'put' : 'post';
      
      const response = await axiosInstance[method](apiEndpoint, formData);

      if (response.status === 200 || response.status === 201) {
        if (!vehiculeId) {
          setVehiculeId(response.data.data.id);
          setActiveTab('finitions'); // Prochaine étape auto
        } else {
          onSuccess();
        }
      } else {
        setError(response.data.description || "Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (err: any) {
      setError(err.response?.data?.description || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-card">
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Car size={24} color="var(--diwa-blue)" />
               <h3>{vehiculeId ? `Modifier : ${formData.modele}` : 'Nouveau véhicule'}</h3>
            </div>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>

          <div className="admin-tabs">
            <button className={`tab-btn ${activeTab === 'infos' ? 'active' : ''}`} onClick={() => setActiveTab('infos')}>
               <Settings size={16} /> Informations
            </button>
            <button 
              className={`tab-btn ${activeTab === 'finitions' ? 'active' : ''}`} 
              onClick={() => setActiveTab('finitions')}
              disabled={!vehiculeId}
            >
               Finitions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'motorisations' ? 'active' : ''}`} 
              onClick={() => setActiveTab('motorisations')}
              disabled={!vehiculeId}
            >
               Motorisations
            </button>
            <button 
              className={`tab-btn ${activeTab === 'options' ? 'active' : ''}`} 
              onClick={() => setActiveTab('options')}
              disabled={!vehiculeId}
            >
               Options & Accessoires
            </button>
          </div>

          <div className="modal-body-wrapper">
            {activeTab === 'infos' && (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-main-scroll" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    <Settings size={18} color="var(--diwa-blue)" /> Informations Générales & Stock
                  </h3>
                  <div className="form-grid">
                    <div className="form-column">
                      <div className="form-group-row">
                        <div className="form-group flex-1">
                          <label>Marque</label>
                          <select name="marque" value={formData.marque} onChange={handleInputChange}>
                            <option value="MG">MG</option>
                            <option value="ISUZU">ISUZU</option>
                            <option value="CHEVROLET">CHEVROLET</option>
                            <option value="BAIC">BAIC</option>
                          </select>
                        </div>
                        <div className="form-group flex-2">
                          <label>Modèle</label>
                          <input name="modele" value={formData.modele} onChange={handleInputChange} placeholder="Ex: Cyberster" required />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group flex-1">
                          <label>Année</label>
                          <input type="number" name="annee" value={formData.annee} onChange={handleInputChange} />
                        </div>
                        <div className="form-group flex-2">
                          <label>Prix de Base (FCFA)</label>
                          <input type="number" name="prixBase" value={formData.prixBase} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group flex-1">
                          <label>Stock</label>
                          <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                      </div>

                      <div className="form-group">
                        <label>Dossier Photos 360°</label>
                        <div className={`upload-dropzone ${formData.dossier360 ? 'has-file' : ''}`}>
                             {uploading.folder360 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Loader2 className="animate-spin" size={16} /> <span>Téléversement du dossier...</span>
                                </div>
                             ) : formData.dossier360 ? (
                                <div className="upload-status text-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                     <CheckCircle2 size={16} /> <span>Séquence 360° configurée : {formData.dossier360}</span>
                                   </div>
                                   <button type="button" className="text-red" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }} onClick={handleDelete360}>
                                     <Trash2 size={14} /> Retirer le dossier
                                   </button>
                                </div>
                             ) : (
                                <div className="upload-prompt">
                                  <Upload size={20} />
                                  <span>Cliquez pour sélectionner le DOSSIER de 24 photos</span>
                                  {/* ATTRIBUTS SPECIAUX POUR SELECTION DE DOSSIER */}
                                  <input 
                                    type="file" 
                                    // @ts-ignore
                                    webkitdirectory="" 
                                    // @ts-ignore
                                    directory="" 
                                    multiple 
                                    onChange={handleFolderUpload} 
                                  />
                                </div>
                             )}
                        </div>
                        <input name="dossier360" value={formData.dossier360} onChange={handleInputChange} style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.6 }} placeholder="Chemin manuel si besoin" />
                      </div>

                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Couleurs et Images Associées</label>
                        <div className="color-adder-container" style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1 1 150px' }}>
                             <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Code Hex (ex: #A32020)</label>
                             <div style={{ display: 'flex', gap: '8px' }}>
                               <input type="color" value={newColorHex} onChange={handleColorHexChange} style={{ height: '38px', width: '45px', padding: '0', cursor: 'pointer' }} />
                               <input type="text" value={newColorHex} onChange={handleColorHexChange} placeholder="#HEX" style={{ width: '100%' }} />
                             </div>
                          </div>
                          <div style={{ flex: '2 1 200px' }}>
                             <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Nom de la couleur</label>
                             <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Ex: Red Spinal Mica" />
                          </div>
                          <div style={{ flex: '2 1 200px' }}>
                             <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Image du véhicule</label>
                             <input type="file" accept="image/*" onChange={(e) => setNewColorFile(e.target.files?.[0] || null)} style={{ padding: '6px' }} />
                          </div>
                          <Button type="button" variant="primary" onClick={addColorWithImage} disabled={uploading.image}>
                             {uploading.image ? <Loader2 size={16} className="animate-spin" /> : 'Ajouter'}
                          </Button>
                        </div>
                        
                        <div className="colors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                          {formData.couleursDispo.map((colorStr, i) => {
                             let colorObj = { hex: colorStr, name: 'Inconnu', image: '' };
                             try { colorObj = JSON.parse(colorStr); } catch(e) {}
                             
                             return (
                               <div key={i} className="color-card" style={{ border: `2px solid ${colorObj.hex}`, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                 {colorObj.image && <img src={getImageUrl(colorObj.image)} alt={colorObj.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
                                 <div style={{ padding: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: colorObj.hex }} />
                                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{colorObj.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeColorObj(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                        {formData.imagePrincipale && (
                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={14} /> Image principale configurée (Première couleur)
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="form-column media-column">
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                        <Share2 size={18} color="var(--diwa-blue)" /> Studio Média & Showroom
                      </h3>
                      <div className="media-upload-area">
                        <label>Modèle 3D (.glb)</label>
                        <div className={`upload-dropzone ${formData.fichierGlb ? 'has-file' : ''}`}>
                          {uploading.glb ? <Loader2 className="animate-spin" /> : formData.fichierGlb ? (
                            <div className="upload-status text-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <CheckCircle2 size={16} /> <span>Fichier prêt</span>
                               </div>
                               <button type="button" className="text-red" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setFormData(prev => ({...prev, fichierGlb: null}))}>
                                 <Trash2 size={14} /> Retirer
                               </button>
                            </div>
                          ) : (
                            <div className="upload-prompt">
                              <Upload size={20} /><span>Cliquez pour uploader le modèle (.glb)</span>
                              <input type="file" accept=".glb" onChange={(e) => handleFileUpload(e, 'glb')} />
                            </div>
                          )}
                        </div>
                        {formData.fichierGlb && (
                          <div className="preview-3d-small" style={{ position: 'relative' }}>
                            <button 
                              type="button" 
                              className="delete-overlay" 
                              style={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }}
                              onClick={() => setFormData(prev => ({...prev, fichierGlb: null}))}
                            >
                               <X size={18} />
                            </button>
                            <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                              <Suspense fallback={null}>
                                <Stage environment="city" intensity={0.5}>
                                   <Model url={getImageUrl(formData.fichierGlb)} />
                                </Stage>
                              </Suspense>
                              <OrbitControls makeDefault enableZoom={false} />
                            </Canvas>
                          </div>
                        )}
                      </div>

                      {/* L'image principale est gérée via les couleurs */}
                      
                      {/* Fiche Technique PDF */}
                      <div className="media-upload-area" style={{ marginTop: '24px' }}>
                        <label>Fiche Technique (PDF)</label>
                        <div className={`upload-dropzone ${formData.ficheTechnique ? 'has-file' : ''}`}>
                          {uploading.pdf ? <Loader2 className="animate-spin" /> : formData.ficheTechnique ? (
                            <div className="upload-status text-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <CheckCircle2 size={16} /> <span>Fiche Technique configurée</span>
                               </div>
                               <button type="button" className="text-red" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setFormData(prev => ({...prev, ficheTechnique: null}))}>
                                 <Trash2 size={14} /> Retirer
                               </button>
                            </div>
                          ) : (
                            <div className="upload-prompt">
                              <Upload size={20} /><span>Cliquez pour uploader la fiche technique (.pdf)</span>
                              <input type="file" accept=".pdf" onChange={handlePdfUpload} />
                            </div>
                          )}
                        </div>
                        {formData.ficheTechnique && (
                          <div style={{ marginTop: '8px', padding: '10px', background: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #bae6fd' }}>
                             <Info size={16} color="#0369a1" />
                             <a href={getImageUrl(formData.ficheTechnique)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, textDecoration: 'none' }}>
                               Visualiser la fiche technique actuelle
                             </a>
                          </div>
                        )}
                      </div>

                      {/* Galerie Multi-Images */}
                      <div className="media-upload-area gallery-area" style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                           <label>Photos Intérieur (Habitacle)</label>
                           {uploading.gallery && <Loader2 size={16} className="animate-spin" color="var(--diwa-blue)" />}
                        </div>
                        
                        <div className="gallery-grid">
                          {formData.imagesGalerie.map((img, index) => (
                            <div key={index} className="gallery-item">
                               <img src={img.url.startsWith('blob:') ? img.url : getImageUrl(img.url)} alt={`Gallery ${index}`} />
                               <div className="gallery-item-overlay">
                                  <select 
                                    value={img.vue} 
                                    onChange={(e) => updateGalleryImageVue(index, e.target.value)}
                                    className="vue-selector-mini"
                                  >
                                    <option value="INTERIEUR">Habitacle</option>
                                    <option value="TABLEAU_DE_BORD">Tableau</option>
                                    <option value="DIVERS">Détails</option>
                                  </select>
                                  <button 
                                    type="button" 
                                    onClick={() => removeGalleryImage(index)} 
                                    className="remove-gallery-btn"
                                    style={{ 
                                      background: '#ef4444', 
                                      color: 'white', 
                                      border: 'none', 
                                      borderRadius: '4px',
                                      padding: '4px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Trash2 size={10} />
                                  </button>
                               </div>
                            </div>
                          ))}
                          <div className="gallery-add-card">
                             <Plus size={24} />
                             <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="form-error"><AlertCircle size={16} /> {error}</div>}
              </form>
            )}

            {activeTab === 'finitions' && vehiculeId && (
              <SubEntityTab 
                title="Tableau des Finitions"
                items={finitions}
                fields={[
                  { name: 'nom', label: 'Nom', type: 'text', placeholder: 'Standard, Elite...' },
                  { name: 'prixSupplement', label: 'Prix Supp. (FCFA)', type: 'number' },
                  { name: 'image', label: 'Image', type: 'image' }
                ]}
                vehiculeId={vehiculeId}
                endpoint="/finitions"
                onRefresh={fetchSubEntities}
              />
            )}

            {activeTab === 'motorisations' && vehiculeId && (
              <SubEntityTab 
                title="Tableau des Motorisations"
                items={motorisations}
                fields={[
                  { name: 'moteur', label: 'Moteur', type: 'text', placeholder: 'Ex: 1.9L Ddi' },
                  { name: 'type', label: 'Type', type: 'select', options: ['DIESEL', 'ESSENCE', 'ELECTRIQUE', 'HYBRIDE'] },
                  { name: 'puissance', label: 'Puissance (ch)', type: 'number' },
                  { name: 'couple', label: 'Couple (Nm)', type: 'number' },
                  { name: 'prix', label: 'Prix (FCFA)', type: 'number' }
                ]}
                vehiculeId={vehiculeId}
                endpoint="/motorisations"
                onRefresh={fetchSubEntities}
              />
            )}

            {activeTab === 'options' && vehiculeId && (
              <SubEntityTab 
                title="Options & Accessoires"
                items={options}
                fields={[
                  { name: 'nom', label: 'Nom', type: 'text' },
                  { name: 'type', label: 'Catégorie', type: 'select', options: ['CONFORT', 'SECURITE', 'ESTHETIQUE', 'PACK'] },
                  { name: 'prixSupplement', label: 'Prix (FCFA)', type: 'number' }
                ]}
                vehiculeId={vehiculeId}
                endpoint="/options-vehicule"
                onRefresh={fetchSubEntities}
              />
            )}
          </div>

          {/* Pied de page permanent */}
          <div className="modal-footer">
            <Button type="button" variant="outline" onClick={onClose} icon={<ArrowLeft size={18} />}>
              Retourner à la liste
            </Button>
            {activeTab === 'infos' && (
              <Button type="button" variant="primary" disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? '...' : vehiculeId ? 'Enregistrer les modifications' : 'Suivant (Finitions) →'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; 
          z-index: 9999; backdrop-filter: blur(10px); padding: 10px;
        }
        .modal-container { 
          width: 95%; max-width: 1000px; 
          height: 80vh; /* Réduit pour garantir la visibilité sur tous les écrans */
          background: white; border-radius: 12px; 
          display: flex; flex-direction: column; 
          overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
          position: relative;
        }
        .modal-card { display: flex; flex-direction: column; height: 100%; width: 100%; position: relative; }
        
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .admin-tabs { display: flex; background: #f8fafc; padding: 0 24px; border-bottom: 1px solid #e2e8f0; gap: 4px; overflow-x: auto; flex-shrink: 0; }
        
        .tab-btn { padding: 14px 20px; border: none; background: transparent; color: #64748b; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; }
        .tab-btn.active { color: var(--diwa-blue); border-bottom-color: var(--diwa-blue); background: white; }
        
        /* C'est ici que le scroll doit être garanti */
        .modal-body-wrapper { 
          flex: 1; 
          overflow-y: auto; 
          background: #ffffff;
          min-height: 0; 
          display: block; /* Passage en block pour un scroll natif plus fiable */
        }
        
        .form-main-scroll { padding: 32px; padding-bottom: 60px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; }
        
        .modal-footer { 
          padding: 20px 24px; 
          border-top: 2px solid #e2e8f0; 
          display: flex; justify-content: flex-end; gap: 16px; 
          background: #f1f5f9; /* Plus foncé pour bien le distinguer */
          flex-shrink: 0;
          z-index: 10;
        }

        .upload-dropzone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 16px; text-align: center; background: #f8fafc; }
        .preview-3d-small { height: 150px; background: #000; border-radius: 12px; margin-top: 8px; position: relative; }
        .image-preview-rect { height: 150px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; position: relative; }
        
        .image-preview-rect img { width: 100%; height: 100%; object-fit: contain; background: #f8fafc; }
        
        .delete-overlay {
            position: absolute; top: 6px; right: 6px;
            background: rgba(255, 255, 255, 0.8); color: #ef4444; border: none;
            width: 24px; height: 24px; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 5; transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .delete-overlay:hover { background: #fee2e2; transform: scale(1.1); }
        
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; margin-top: 10px; }
        .gallery-item { position: relative; height: 60px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; }
        .gallery-item img { width: 100%; height: 100%; object-fit: contain; }
        .gallery-item-overlay {
            position: absolute; inset: 0; background: rgba(0,0,0,0.6);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.2s; gap: 4px; padding: 2px;
        }
        .gallery-item:hover .gallery-item-overlay { opacity: 1; }
        .vue-selector-mini {
            font-size: 8px; background: white; border: none; border-radius: 2px;
            padding: 1px 2px; width: 100%; cursor: pointer; color: black;
        }
        .gallery-add-card { 
          height: 60px; border: 2px dashed #cbd5e1; border-radius: 8px; 
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; transition: all 0.2s; background: #f8fafc; color: #64748b;
        }
        .gallery-add-card:hover { border-color: var(--diwa-blue); color: var(--diwa-blue); background: #f0f9ff; }

        /* Forcer l'apparence de la barre de scroll */
        .modal-body-wrapper::-webkit-scrollbar { width: 12px; }
        .modal-body-wrapper::-webkit-scrollbar-track { background: #f1f5f9; }
        .modal-body-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 3px solid #f1f5f9; }
        .modal-body-wrapper::-webkit-scrollbar-thumb:hover { background: var(--diwa-blue); }

        @media (max-width: 768px) {
          .modal-container { height: 95vh; width: 100%; border-radius: 0; }
          .form-main-scroll { padding: 16px; padding-bottom: 80px; }
          .form-grid { gap: 24px; }
        }
      `}</style>
    </div>
  );
};

// --- Sous-composant pour les onglets Finitions/Motorisations/Options ---

interface SubEntityTabProps {
  title: string;
  items: any[];
  fields: { name: string; label: string; type: string; options?: string[]; placeholder?: string }[];
  vehiculeId: number;
  endpoint: string;
  onRefresh: () => void;
}

const SubEntityTab: React.FC<SubEntityTabProps> = ({ title, items, fields, vehiculeId, endpoint, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localData, setLocalData] = useState<any>({});

  const resetForm = () => {
    const initial = {};
    fields.forEach(f => (initial as any)[f.name] = f.type === 'number' ? 0 : f.type === 'select' ? f.options![0] : '');
    setLocalData(initial);
  };

  useEffect(() => resetForm(), [fields]);

  const handleSave = async () => {
    const method = editingId ? 'put' : 'post';
    const url = editingId 
      ? `/api/v1${endpoint}/update/${editingId}`
      : `/api/v1${endpoint}/save`;

    try {
      const response = await axiosInstance[method](url, { ...localData, vehiculeId });
      if (response.data.statut === 200 || response.data.statut === 201) {
        setShowAdd(false);
        setEditingId(null);
        resetForm();
        onRefresh();
      }
    } catch (err) {
      console.error("Erreur sauvegarde sous-entité:", err);
    }
  };

  const handleEdit = (item: any) => {
    setLocalData(item);
    setEditingId(item.id);
    setShowAdd(true);
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', e.target.files[0]);
      try {
        const response = await axiosInstance.post('/api/v1/admin/media/vehicule/image', uploadFormData);
        if (response.data.statut === 201) {
          setLocalData({ ...localData, [fieldName]: response.data.data.url });
        }
      } catch (err) {
        console.error("Erreur upload image:", err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      await axiosInstance.delete(`/api/v1${endpoint}/delete/${id}`);
      onRefresh();
    } catch (err) {
      console.error("Erreur suppression sous-entité:", err);
    }
  };

  return (
    <div className="sub-tab-container">
      <div className="sub-tab-header">
        <h4>{title} <Badge variant="neutral">{items.length}</Badge></h4>
        {!showAdd && <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => { setEditingId(null); resetForm(); setShowAdd(true); }}>Ajouter</Button>}
      </div>

      {showAdd && (
        <div className="inline-form">
          <div className="inline-form-grid">
            {fields.map(field => (
              <div key={field.name} className="inline-group">
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <select 
                    value={localData[field.name]} 
                    onChange={e => setLocalData({ ...localData, [field.name]: e.target.value })}
                  >
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'image' ? (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleSubImageUpload(e, field.name)}
                    />
                    {localData[field.name] && (
                      <img 
                        src={getImageUrl(localData[field.name])} 
                        alt="Preview" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginTop: '5px', borderRadius: '4px' }} 
                      />
                    )}
                  </div>
                ) : (
                  <input 
                    type={field.type} 
                    value={localData[field.name] ?? ''} 
                    placeholder={field.placeholder}
                    onChange={e => setLocalData({ ...localData, [field.name]: field.type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value })}
                  />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Annuler</Button>
              <Button variant="primary" size="sm" icon={<Save size={16} />} onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        </div>
      )}

      <div className="sub-items-table">
        <table className="sub-table">
          <thead>
            <tr>
              {fields.map(f => <th key={f.name}>{f.label}</th>)}
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                {fields.map(f => (
                  <td key={f.name}>
                    {f.type === 'image' && item[f.name] ? (
                      <img 
                        src={getImageUrl(item[f.name])} 
                        alt="Preview" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    ) : (
                      item[f.name]
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right' }}>
                  <button className="icon-btn" onClick={() => handleEdit(item)}><Pencil size={14} /></button>
                  <button className="icon-btn text-red" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Mock Badge component for the sub-header
const Badge = ({ children, variant }: any) => (
  <span style={{ 
    padding: '2px 8px', 
    borderRadius: '100px', 
    fontSize: '0.75rem', 
    background: variant === 'neutral' ? '#f1f5f9' : '#dcfce7',
    color: variant === 'neutral' ? '#64748b' : '#166534',
    marginLeft: '8px'
  }}>
    {children}
  </span>
);

export default AdminVehiculeForm;
