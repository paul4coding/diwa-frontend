import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Shield, Mail, Check, X, Edit2, Trash2, Search, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';

interface UserData {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
  emailVerified: boolean;
  telephone?: string;
  prenom?: string;
  nom?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ROLE_ADMIN: '#E74C3C',
  ROLE_DG: '#8E44AD',
  ROLE_CHEF_TECHNICIEN: '#D35400',
  ROLE_RECEPTIONNISTE: '#2980B9',
  ROLE_STOCK: '#16A085',
  ROLE_CLIENT: '#27AE60',
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Mutation: Delete User
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => axiosInstance.delete(`/api/v1/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert("Utilisateur supprimé");
    },
    onError: (err) => {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  });

  const handleDelete = (userId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteMutation.mutate(userId);
    }
  };

  // Fetch Users
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ['admin-users'],
    queryFn: () => axiosInstance.get('/api/v1/admin/users').then(res => res.data)
  });

  if (!isAdmin) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <Shield size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#1e293b' }}>Accès Restreint</h2>
        <p style={{ color: '#64748b' }}>Seuls les administrateurs système peuvent gérer les utilisateurs.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || u.roles?.some(r => r.name === roleFilter);
    return matchesSearch && matchesRole;
  });

  if (isLoading) return <div style={{ padding: 40 }}>Chargement des utilisateurs...</div>;

  return (
    <>
    <div className="admin-users-page" style={{ padding: '30px' }}>
      
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
            <Users size={32} color="#1A5276" />
            Gestion des Utilisateurs
          </h2>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Contrôlez les accès et les permissions de l'équipe DIWA.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
            background: '#1A5276', color: '#fff', border: 'none', borderRadius: '12px', 
            fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 82, 118, 0.2)' 
          }}>
          <UserPlus size={20} />
          Nouvel Utilisateur
        </button>
      </header>

      {/* ── FILTERS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px',
              background: '#fff', transition: 'border-color 0.2s'
            }} />
        </div>
        <div style={{ width: '250px', position: 'relative' }}>
          <Filter style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 14px 14px 45px', borderRadius: '14px', 
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px',
              background: '#fff', appearance: 'none', cursor: 'pointer'
            }}>
            <option value="">Tous les rôles</option>
            {Object.keys(ROLE_COLORS).map(role => (
              <option key={role} value={role}>{role.replace('ROLE_', '')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────── */}
      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '18px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Utilisateur</th>
              <th style={{ textAlign: 'left', padding: '18px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Rôles</th>
              <th style={{ textAlign: 'left', padding: '18px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Statut Email</th>
              <th style={{ textAlign: 'right', padding: '18px 24px', color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: '#eff6ff', color: '#1A5276', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' 
                    }}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        {u.prenom || u.nom ? `${u.prenom || ''} ${u.nom || ''}` : u.username}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>@{u.username}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {u.email}
                      </div>
                      {u.telephone && (
                        <div style={{ fontSize: '12px', color: '#1A5276', fontWeight: 600, marginTop: '2px' }}>
                          {u.telephone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {u.roles.map(r => (
                      <span key={r.id} style={{ 
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', 
                        fontWeight: 700, background: `${ROLE_COLORS[r.name] || '#94a3b8'}15`, 
                        color: ROLE_COLORS[r.name] || '#94a3b8', border: `1px solid ${ROLE_COLORS[r.name] || '#94a3b8'}30`
                      }}>
                        {r.name.replace('ROLE_', '')}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  {u.emailVerified ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#27AE60', fontSize: '13px', fontWeight: 600 }}>
                      <Check size={16} /> Vérifié
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '13px' }}>
                      <X size={16} /> Non vérifié
                    </span>
                  )}
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => setEditingUser(u)}
                      style={{ padding: '8px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '8px' }} 
                      title="Modifier">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)}
                      style={{ padding: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '8px' }} 
                      title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── NO USERS PLACEHOLDER ─────────────────────────── */}
      {filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
          <Users size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
          <p>Aucun utilisateur ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
    
    {/* ── MODALS ─────────────────────────────────────────── */}
    {(showAddModal || editingUser) && (
      <UserModal 
        user={editingUser} 
        onClose={() => { setShowAddModal(false); setEditingUser(null); }} 
        onSuccess={() => {
          setShowAddModal(false);
          setEditingUser(null);
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }}
      />
    )}
    </>
  );
}

// ── USER MODAL COMPONENT ──────────────────────────────────────
function UserModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    password: '',
    roles: user?.roles?.map((r: any) => r.name) || ['ROLE_CLIENT']
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => user 
      ? axiosInstance.put(`/api/v1/admin/users/${user.id}`, data)
      : axiosInstance.post('/api/v1/admin/users', data),
    onSuccess: () => {
      alert(user ? "Modifié avec succès" : "Créé avec succès");
      onSuccess();
    },
    onError: (err: any) => {
      console.error(err);
      alert("Erreur: " + (err.response?.data?.message || "Action impossible"));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter((r: string) => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <Card style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>{user ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Prénom</label>
              <input 
                type="text" 
                value={formData.prenom}
                onChange={e => setFormData({...formData, prenom: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Nom</label>
              <input 
                type="text" 
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Nom d'utilisateur</label>
            <input 
              type="text" 
              required
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Téléphone</label>
            <input 
              type="text" 
              value={formData.telephone}
              onChange={e => setFormData({...formData, telephone: e.target.value})}
              placeholder="+228..."
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          {!user && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
              <input 
                type="password" 
                required
                onChange={e => setFormData({...formData, password: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
              />
            </div>
          )}
          
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Rôles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(ROLE_COLORS).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  style={{ 
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, 
                    cursor: 'pointer', border: '1px solid',
                    background: formData.roles.includes(role) ? ROLE_COLORS[role] : 'transparent',
                    color: formData.roles.includes(role) ? 'white' : ROLE_COLORS[role],
                    borderColor: ROLE_COLORS[role]
                  }}>
                  {role.replace('ROLE_', '')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={saveMutation.isPending} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#1A5276', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              {saveMutation.isPending ? 'Enregistrement...' : (user ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
