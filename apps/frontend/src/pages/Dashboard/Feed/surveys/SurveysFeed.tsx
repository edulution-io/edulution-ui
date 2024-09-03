import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveysSidebarIcon } from '@/assets/icons';
import { APPS } from '@libs/appconfig/types';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useIsSurveysActive from '@/pages/Surveys/useIsSurveysActive';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import SurveysList from '@/pages/Dashboard/Feed/surveys/OpenSurveysList';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';

const SurveysFeed = () => {
  const { openSurveys } = useSurveyTablesPageStore();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const isActive = useIsSurveysActive();
  if (!isActive || isSuperAdmin) {
    return null;
  }

  return (
    <AccordionItem value={APPS.SURVEYS}>
      <FeedWidgetAccordionTrigger
        src={SurveysSidebarIcon}
        alt={`${APPS.SURVEYS}-notification-icon`}
        labelTranslationId="surveys.sidebar"
      />
      <AccordionContent>
        {openSurveys.length > 0 ? (
          <SurveysList
            items={openSurveys}
            className="mb-6 mt-2"
          />
        ) : (
          <div className="mb-6 mt-2 text-center">{t('feed.noSurveys')}</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default SurveysFeed;
