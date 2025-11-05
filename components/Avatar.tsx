import React from 'react';
import DunaCanariasJewelryLogo from '../assets/DunaCanariasJewelryLogo';

interface AvatarProps {
  src?: string;
  className?: string;
  alt: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, className, alt }) => {
  const baseClasses = "rounded-full object-cover bg-[#233140] p-1";
  const finalClassName = `${baseClasses} ${className}`;

  if (src) {
    return <img src={src} alt={alt} className={finalClassName} />;
  }
  return (
    <div className={finalClassName}>
        <DunaCanariasJewelryLogo />
    </div>
  );
};

export default Avatar;
