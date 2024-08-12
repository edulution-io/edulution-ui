import React from 'react';
import { useTranslation } from 'react-i18next';
import { MailIcon } from '@/assets/icons';
import { APPS } from '@libs/appconfig/types';
import MailList from '@/pages/Dashboard/Feed/mails/MailList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';

const MailsFeed = () => {
  const { mails } = useMailsStore();

  const { t } = useTranslation();

  const isActive = useIsMailsActive();
  if (!isActive) {
    return null;
  }

  return (
    <AccordionItem value={APPS.MAIL}>
      <FeedWidgetAccordionTrigger
        src={MailIcon}
        alt={`${APPS.MAIL}-notification-icon`}
        labelTranslationId="mail.sidebar"
      />
      <AccordionContent>
        {mails.length > 0 ? (
          <MailList
            items={mails}
            className="mb-6 mt-2"
          />
        ) : (
          <div className="mb-6 mt-2 text-center">{t('feed.noMails')}</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MailsFeed;
