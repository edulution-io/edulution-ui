import React from 'react';

interface ImageIconProps {
  src: string;
  alt?: string;
  className?: string;
  [x: string]: any;
}

export const ItemImageIcon: React.FC<ImageIconProps> = ({ src, alt, ...props }) => {
  if (!src) {
    return null;
  }
  return <img className="object-scale-down h-12 w-12" src={src} alt={alt || 'icon'} {...props} />;
};

export const SideBarImageIcon: React.FC<ImageIconProps> = ({ src, alt, ...props }) => {
  if (!src) {
    return null;
  }
  return <img className="object-scale-down h-24 w-24" src={src} alt={alt || 'icon'} {...props} />;
};

const Icons = { ItemImageIcon, SideBarImageIcon };

export default Icons;