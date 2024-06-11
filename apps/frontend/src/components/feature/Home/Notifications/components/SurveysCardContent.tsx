import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveysSidebarIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Survey } from '@/pages/Surveys/types/survey';
import SurveysList from '@/components/feature/Home/Notifications/components/SurveysList';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';

interface SurveysCardContentProps {
  surveys: Survey[];
}

const SurveysCardContent = (props: SurveysCardContentProps) => {
  const { surveys } = props;
  const { t } = useTranslation();

  return (
    <Collapsible
      defaultOpen={true}
    >
      <CollapsibleTrigger className="text-xl font-bold flex">
        <img
          src={SurveysSidebarIcon}
          alt="survey-notification"
          width={BUTTONS_ICON_WIDTH}
          className="mr-4"
        />
        {t('survey.sidebar')}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SurveysList items={surveys} className="mt-2 mb-6"/>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SurveysCardContent;
