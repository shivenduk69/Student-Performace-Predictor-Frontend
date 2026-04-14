import React from 'react';

const AnimatedLogo = ({ compact = false }) => {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <svg className="brand-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="10" width="48" height="44" rx="10" className="brand-frame" />
        <path d="M16 41 L25 31 L33 36 L45 22" className="brand-line" />
        <circle cx="45" cy="22" r="3" className="brand-dot" />
      </svg>
      <div className="brand-text">
        <strong>Lumora</strong>
        {!compact && <span>Predictive Student Intelligence</span>}
      </div>
    </div>
  );
};

export default AnimatedLogo;
