import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'diwa-btn';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;
  const loadingClass = loading ? 'is-loading' : '';
  const fullWidthClass = fullWidth ? 'is-full-width' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${fullWidthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="diwa-btn__spinner"></span>}
      <div className="diwa-btn__content">
        {!loading && icon && <span className="diwa-btn__icon">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;
