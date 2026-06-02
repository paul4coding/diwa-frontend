import React from 'react';
import './Badge.css';

type BrandType = 'MG' | 'ISUZU' | 'CHEVROLET' | 'BAIC';

interface BadgeProps {
  children?: React.ReactNode;
  label?: string; // Gardé pour compatibilité
  brand?: BrandType;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children,
  label, 
  brand, 
  variant = 'brand',
  className = ''
}) => {
  const baseClass = 'diwa-badge';
  const variantClass = brand ? `diwa-badge--brand-${brand.toLowerCase()}` : `diwa-badge--${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children || label}
    </span>
  );
};

export default Badge;
