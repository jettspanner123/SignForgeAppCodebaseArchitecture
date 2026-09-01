import React from 'react';
import weplmImage from '../assets/weplm.jpeg';

interface WePlmLogoProps {
  className?: string;
  variant?: 'blue' | 'white';
}

export const WePlmLogo: React.FC<WePlmLogoProps> = ({
  className = "h-12 w-auto",
}) => {
  return (
    <img
      src={weplmImage}
      alt="We.PLM Logo"
      className={`object-contain ${className}`}
    />
  );
};

export const WE_PLM_SVG_STRING = `<svg viewBox="0 0 380 230" width="380" height="230" xmlns="http://www.w3.org/2000/svg"><style>.weplm-font-top { font-family: 'Montserrat', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif; font-weight: 900; } .weplm-font-bottom { font-family: 'Montserrat', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif; font-weight: 900; letter-spacing: 2px; }</style><g><text x="15" y="105" fill="#0B258A" font-size="112" class="weplm-font-top" letter-spacing="-3px">We.</text><text x="128" y="198" fill="#0B258A" font-size="100" class="weplm-font-bottom">PLM</text></g></svg>`;
