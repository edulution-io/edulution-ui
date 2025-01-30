import React from 'react';
import { AvatarFallback, AvatarSH, AvatarImage } from '@/components/ui/AvatarSH';

type AvatarProps = {
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  imageSrc?: string;
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ user, imageSrc, className }) => {
  const getAvatarFallbackText = () => {
    if (!user) return '-';
    const { username, firstName = '', lastName = '' } = user;
    const fallbackText = `${firstName[0] || ''}${lastName[0] || ''}`;
    return fallbackText || username.slice(0, 2).toUpperCase() || '-';
  };

  return (
    <AvatarSH className={className}>
      <AvatarImage
        src={imageSrc}
        alt={user?.firstName}
      />
      <AvatarFallback className="bg-ciGrey text-foreground">{getAvatarFallbackText()}</AvatarFallback>
    </AvatarSH>
  );
};
export default Avatar;
