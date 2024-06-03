import React from 'react';
import { useTranslation } from 'react-i18next';
import MailIcon from '@/assets/icons/edulution/Mail.svg';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { CardContent } from '@/components/shared/Card';
import Mail from '@/components/feature/Home/Notifications/mail';

interface MailCardContentProps {
  mails: JSON[] | Mail[]
}

const MailCardContent = (props: MailCardContentProps) => {
  const { mails } = props;
  const { t } = useTranslation();

  return (
    <CardContent>
      <h4
        color="white"
        className="font-bold"
      >
        MAILBOX
        <p>{t('mail.sidebar')}</p>
        <img
          src={MailIcon}
          alt="mail"
          width={BUTTONS_ICON_WIDTH}
        />
      </h4>
      <div className="mt-4 flex flex-col justify-between gap-6">
        {
          // `${JSON.stringify(mails, null, 2)}`
          mails.map((mail) => (
            <>{JSON.stringify(mail, null, 2)}</>
          ))
        }
      </div>
    </CardContent>
  );
};

export default MailCardContent;
