import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './Card.css';

gsap.registerPlugin(useGSAP);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  shadow = 'sm',
  title,
  subtitle,
  style
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const baseClass = 'diwa-card';
  const hoverClass = hoverable ? 'is-hoverable' : '';
  const paddingClass = `${baseClass}--padding-${padding}`;
  const shadowClass = `${baseClass}--shadow-${shadow}`;

  useGSAP(() => {
    if (hoverable && cardRef.current) {
      const card = cardRef.current;
      
      const onEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.01,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderColor: 'var(--diwa-blue)',
          duration: 0.4,
          ease: 'power2.out'
        });
      };

      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: shadow === 'sm' ? 'var(--shadow-sm)' : shadow === 'md' ? 'var(--shadow-md)' : shadow === 'lg' ? 'var(--shadow-lg)' : 'none',
          borderColor: 'var(--gray-200)',
          duration: 0.4,
          ease: 'power2.out'
        });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      return () => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      };
    }
  }, { scope: cardRef, dependencies: [hoverable] });

  return (
    <div 
      ref={cardRef}
      className={`${baseClass} ${hoverClass} ${paddingClass} ${shadowClass} ${className}`}
      style={style}
    >
      {(title || subtitle) && (
        <div className="diwa-card-header">
           {title && <h3 className="diwa-card-title">{title}</h3>}
           {subtitle && <p className="diwa-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="diwa-card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
