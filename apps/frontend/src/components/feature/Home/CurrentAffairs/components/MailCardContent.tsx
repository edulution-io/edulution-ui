import React from 'react';
import { useTranslation } from 'react-i18next';
import Mail from '@/lib/src/notification/types/mail';
import MailIcon from '@/assets/icons/edulution/Mail.svg';
import { MailList } from '@/components/shared/MailList';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';

interface MailCardContentProps {
  mails: Mail[];
}

const MailCardContent = (props: MailCardContentProps) => {
  const { mails } = props;
  const { t } = useTranslation();

  return (
    <Collapsible
      defaultOpen={true}
    >
      <CollapsibleTrigger className="text-xl font-bold flex">
        <img
          src={MailIcon}
          alt="mail-notification"
          width={BUTTONS_ICON_WIDTH}
          className="mr-4"
        />
        {t('mail.sidebar')}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <MailList items={mails} className="mt-2 mb-6" />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MailCardContent;
