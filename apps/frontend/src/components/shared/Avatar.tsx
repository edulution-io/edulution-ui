import React from 'react';
import { useAuth } from 'react-oidc-context';
import { AvatarSH, AvatarFallback } from '@/components/ui/AvatarSH';

const Avatar: React.FC = () => {
  const { user } = useAuth();
  const givenName = user?.profile?.given_name ?? 'N';
  const familyName = user?.profile?.family_name ?? 'N';

  return (
    <AvatarSH>
      <AvatarFallback className="bg-ciLightGrey text-black">{givenName[0] + familyName[0]}</AvatarFallback>
    </AvatarSH>
  );
};
export default Avatar;
