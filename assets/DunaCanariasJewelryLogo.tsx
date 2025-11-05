import React from 'react';

const DunaCanariasJewelryLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Main Text */}
    <text
      x="100"
      y="80"
      textAnchor="middle"
      fontFamily="Garamond, serif"
      fontSize="40"
      fontWeight="bold"
      fill="currentColor"
      letterSpacing="1"
    >
      DUNA
    </text>
    <text
      x="100"
      y="120"
      textAnchor="middle"
      fontFamily="Garamond, serif"
      fontSize="40"
      fontWeight="bold"
      fill="currentColor"
      letterSpacing="1"
    >
      CANARIAS
    </text>
    
    {/* Subtitle */}
    <text
      x="100"
      y="150"
      textAnchor="middle"
      fontFamily="sans-serif"
      fontSize="12"
      fill="currentColor"
      letterSpacing="2"
      style={{ textTransform: 'uppercase' }}
      opacity="0.9"
    >
      Gestión de Pedidos
    </text>
    
    {/* Border */}
    <rect 
      x="5" y="5" 
      width="190" height="190" 
      rx="15" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
    />
  </svg>
);

export default DunaCanariasJewelryLogo;