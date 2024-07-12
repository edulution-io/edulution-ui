import React, { useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon, SurveysSidebarIcon } from '@/assets/icons';
import MailIcon from '@/assets/icons/edulution/Mail.svg';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Card, CardContent } from '@/components/shared/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import useCurrentAffairsStore from '@/components/feature/Home/CurrentAffairs/CurrentAffairsStore';
import useMailStore from '@/components/feature/Home/Notification/MailStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import { MailList } from '@/components/shared/MailList';
import ConferencesList from '@/components/feature/Home/CurrentAffairs/components/ConferencesList';
import SurveysList from '@/components/feature/Home/CurrentAffairs/components/SurveysList';

const CurrentAffairs = () => {
  const { t } = useTranslation();

  const { shouldUpdate, isUpdating, start, finish } = useCurrentAffairsStore();
  const { conferences, getConferences } = useConferenceStore();
  const { openSurveys, updateOpenSurveys } = useSurveyTablesPageStore();
  const { mails, fetchMails } = useMailStore();

  const cyclicUpdate = useCallback(async () => {
    const fetch = async () => {
      start();
      try {
        await fetchMails();
        await updateOpenSurveys();
        await getConferences();
      } catch (e) {
        console.error(e);
      }
      finish();
    };
    if (shouldUpdate && !isUpdating) {
      await fetch();
    }
  }, []);

  useEffect(() => {
    if (shouldUpdate) {
      cyclicUpdate();
    }
  }, [shouldUpdate]);

  const filteredConferences = useMemo(() => {
    return conferences.filter((conference: Conference) => conference.isRunning);
  }, [conferences]);

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%] overflow-auto"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('current-affairs.title')}</h4>
          <ScrollArea>
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="flex text-xl font-bold">
                <img
                  src={ConferencesIcon}
                  alt="conference-notification"
                  width={BUTTONS_ICON_WIDTH}
                  className="mr-4"
                />
                {t('conferences.sidebar')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {filteredConferences.length > 0 ? (
                  <ConferencesList
                    items={filteredConferences}
                    className="mb-6 mt-2"
                  />
                ) : (
                  <div className="mb-6 mt-2 text-center">{t('current-affairs.noConferences')}</div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="flex text-xl font-bold">
                <img
                  src={SurveysSidebarIcon}
                  alt="survey-notification"
                  width={BUTTONS_ICON_WIDTH}
                  className="mr-4"
                />
                {t('surveys.sidebar')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {openSurveys.length > 0 ? (
                  <SurveysList
                    items={openSurveys}
                    className="mb-6 mt-2"
                  />
                ) : (
                  <div className="mb-6 mt-2 text-center">{t('current-affairs.noSurveys')}</div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="flex text-xl font-bold">
                <img
                  src={MailIcon}
                  alt="mail-notification"
                  width={BUTTONS_ICON_WIDTH}
                  className="mr-4"
                />
                {t('mail.sidebar')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {mails.length > 0 ? (
                  <MailList
                    items={mails}
                    className="mb-6 mt-2"
                  />
                ) : (
                  <div className="mb-6 mt-2 text-center">{t('current-affairs.noMails')}</div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentAffairs;
