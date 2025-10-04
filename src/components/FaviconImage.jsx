import React from 'react';

const FaviconImage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Procurement Icon">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1D4ED8', stopOpacity: 1 }} />
      </linearGradient>
    </defs>

    {/* Background circle */}
    <circle cx="16" cy="16" r="15" fill="url(#grad1)" stroke="#1E40AF" strokeWidth="1" />

    {/* Box/cart icon */}
    <rect x="8" y="10" width="10" height="8" rx="1" fill="white" opacity="0.9" />
    <rect x="9" y="11" width="8" height="1" fill="#3B82F6" />
    <rect x="9" y="13" width="8" height="1" fill="#3B82F6" />
    <rect x="9" y="15" width="8" height="1" fill="#3B82F6" />

    {/* Handle */}
    <path d="M 6 12 Q 4 12 4 14 L 4 16 Q 4 18 6 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 26 12 Q 28 12 28 14 L 28 16 Q 28 18 26 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Wheels */}
    <circle cx="6" cy="20" r="2" fill="#1F2937" />
    <circle cx="26" cy="20" r="2" fill="#1F2937" />
    <circle cx="6" cy="20" r="1" fill="white" />
    <circle cx="26" cy="20" r="1" fill="white" />
  </svg>
);

export default FaviconImage;
