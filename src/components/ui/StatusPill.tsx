import React from 'react';
import './StatusPill.css';

interface StatusPillProps {
  status: string;
  type?: 'rdv' | 'ticket' | 'commande';
}

const StatusPill: React.FC<StatusPillProps> = ({ status, type = 'rdv' }) => {
  const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
  
  const getStatusClass = (status: string) => {
    const s = status.toUpperCase();
    if (['CONFIRME', 'RESOLU', 'TERMINE', 'LIVRE', 'PAYE'].includes(s)) return 'status--success';
    if (['EN_ATTENTE', 'PLANIFIE', 'OUVERT', 'EN_COURS'].includes(s)) return 'status--warning';
    if (['ANNULE', 'FERME', 'REFUSE'].includes(s)) return 'status--error';
    return 'status--info';
  };

  return (
    <div className={`diwa-status-pill ${getStatusClass(status)}`}>
      <span className="status-dot"></span>
      <span className="status-text">{normalizedStatus}</span>
    </div>
  );
};

export default StatusPill;
