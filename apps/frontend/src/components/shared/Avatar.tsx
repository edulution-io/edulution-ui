import React from 'react';
import { AvatarFallback, AvatarSH } from '@/components/ui/AvatarSH';
import useUserStore from '@/store/UserStore/UserStore';

const Avatar: React.FC = () => {
  const { user } = useUserStore();

  const getAvatarFallbackText = () => {
    if (!user) return '-';
    const { username, firstName = '', lastName = '' } = user;
    const fallbackText = `${firstName[0] || ''}${lastName[0] || ''}`;
    return fallbackText || username.slice(0, 2).toUpperCase() || '-';
  };

  return (
    <AvatarSH>
      <AvatarFallback className="bg-muted text-foreground">{getAvatarFallbackText()}</AvatarFallback>
    </AvatarSH>
  );
};
export default Avatar;
