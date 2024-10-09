import React from 'react';
import { useTranslation } from 'react-i18next';
import { MailIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import MailList from '@/pages/Dashboard/Feed/mails/MailList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';
import useLdapGroups from '@/hooks/useLdapGroups';

const MailsFeed = () => {
  const { mails } = useMailsStore();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const isActive = useIsMailsActive();
  if (!isActive || isSuperAdmin) {
    return null;
  }

  return (
    <AccordionItem value={APPS.MAIL}>
      <FeedWidgetAccordionTrigger
        src={MailIcon}
        alt={`${APPS.MAIL}-notification-icon`}
        labelTranslationId="mail.sidebar"
      />
      <AccordionContent className="pb-2">
        {mails.length > 0 ? (
          <MailList
            items={mails}
            className="my-2"
          />
        ) : (
          <span className="my-2 text-center text-sm">{t('feed.noMails')}</span>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MailsFeed;
