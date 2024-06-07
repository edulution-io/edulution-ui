import React from 'react';

interface NativeAppHeaderProps {
  title: string;
  description: string;
  iconSrc: string;
}

const NativeAppHeader = ({ title, iconSrc, description }: NativeAppHeaderProps) => {
  return (
    <div className="flex items-center">
      <img
        src={iconSrc}
        alt=""
        className="h-20 w-20 object-contain"
      />
      <div className="ml-4">
        <h2>{title}</h2>
        <div className="pt-5 sm:pt-0">
          <p className="pb-4">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default NativeAppHeader;
