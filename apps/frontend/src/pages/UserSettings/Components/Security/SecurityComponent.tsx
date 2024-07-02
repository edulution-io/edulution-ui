import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
import cn from '@/lib/utils';
import { SecurityIcon } from '@/assets/icons';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import Separator from '@/components/ui/Separator';
import PasswordChangeForm from '@/pages/UserSettings/Components/Security/compontns/PasswordChangeForm';

const SecurityComponent: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { t } = useTranslation();

  return (
    <div className={cn('absolute bottom-[32px] right-[57px] top-3 h-screen', isMobile ? 'left-4' : 'left-[256px]')}>
      <NativeAppHeader
        title={t('usersettings.security.title')}
        description={t('usersettings.security.description')}
        iconSrc={SecurityIcon}
      />
      <div className="p-4">
        <PasswordChangeForm />
        <Separator className="my-1 bg-ciLightGrey" />
      </div>
    </div>
  );
};

export default SecurityComponent;
