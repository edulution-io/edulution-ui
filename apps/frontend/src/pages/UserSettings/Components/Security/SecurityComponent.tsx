import React from 'react';

import MfaUserSettings from '@/pages/UserSettings/Components/Security/components/MfaUserSettings.tsx';
import Separator from '@/components/ui/Separator.tsx';
import PasswordChangeForm from '@/pages/UserSettings/Components/Security/components/PasswordChangeForm.tsx';

const SecurityComponent: React.FC = () => {
  return (
    <div>
      <MfaUserSettings />
      <Separator className="my-1 bg-ciLightGrey" />
      <PasswordChangeForm />
      <Separator className="my-1 bg-ciLightGrey" />
    </div>
  );
};

export default SecurityComponent;
