import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import { MailIcon } from '@/assets/icons';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import { AccordionContent, AccordionItem } from '@/components/ui/Accordion';
import MailList from '@/components/shared/MailList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useMailStore from '@/pages/Dashboard/Feed/mails/MailStore';

const UnreadMailsAccordionItem = () => {
  const { appConfigs } = useAppConfigsStore();

  const { mails, getMails } = useMailStore();

  const { t } = useTranslation();

  useInterval(() => {
    void getMails();
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    void getMails();
  }, []);

  // TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
  const isMailAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.MAIL.toString()),
    [appConfigs],
  );

  if (!isMailAppActivated) {
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

export default UnreadMailsAccordionItem;
