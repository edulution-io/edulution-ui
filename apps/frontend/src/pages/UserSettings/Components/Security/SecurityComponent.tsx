import React from 'react';

import MfaUserSettings from '@/pages/UserSettings/Components/Security/components/MfaUserSettings.tsx';
import Separator from '@/components/ui/Separator.tsx';
import PasswordChangeForm from '@/pages/UserSettings/Components/Security/components/PasswordChangeForm.tsx';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { t } from 'i18next';
import { SecurityIcon } from '@/assets/icons';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';

const SecurityComponent: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={cn('absolute bottom-[32px] right-[57px] top-3 h-screen', isMobile ? 'left-4' : 'left-[256px]')}>
      <NativeAppHeader
        title={t('security.title')}
        description={t('security.description')}
        iconSrc={SecurityIcon}
      />
      <div className="p-4">
        <PasswordChangeForm />
        <Separator className="my-1 bg-ciLightGrey" />
        <MfaUserSettings />
        <Separator className="my-1 bg-ciLightGrey" />
      </div>
    </div>
  );
};

export default SecurityComponent;
