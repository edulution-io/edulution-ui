import React from 'react';
import { useAuth } from 'react-oidc-context';
import { AvatarFallback, AvatarSH } from '@/components/ui/AvatarSH';

const Avatar: React.FC = () => {
  const { user } = useAuth();

  const getAvatarFallbackText = () => {
    if (!user) return '-';
    const {
      preferred_username: username = '',
      given_name: givenName = '',
      family_name: familyName = '',
    } = user.profile;

    const fallbackText = `${givenName[0] || ''}${familyName[0] || ''}`;
    return fallbackText || username.slice(0, 2).toUpperCase() || '-';
  };

  return (
    <AvatarSH>
      <AvatarFallback className="bg-ciGrey text-black">{getAvatarFallbackText()}</AvatarFallback>
    </AvatarSH>
  );
};
export default Avatar;
