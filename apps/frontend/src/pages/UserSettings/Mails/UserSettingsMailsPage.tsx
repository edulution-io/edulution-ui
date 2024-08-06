import { MailIcon } from '@/assets/icons';
import { DropdownMenu } from '@/components';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const mailSettings = [
  {
    id: '1',
    name: 'Bellwü',
    label: 'mail.bellwue',
    url: 'https://webmail.schulung.multi.schule.de',
  },
];

const UserSettingsMailsPage: React.FC = () => {
  const { t } = useTranslation();
  const [option, setOption] = useState(mailSettings[0].name);

  return (
    <>
      <NativeAppHeader
        title={t('mail.sidebar')}
        description={null}
        iconSrc={MailIcon}
      />
      <div className="w-1/3">
        <DropdownMenu
          options={mailSettings}
          selectedVal={t(option)}
          handleChange={setOption}
        />
      </div>
    </>
  );
};

export default UserSettingsMailsPage;
