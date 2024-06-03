import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveyPageMenuIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { CardContent } from '@/components/shared/Card';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';

interface SurveysCardContentProps {
  surveys: Survey[];
}

const SurveysCardContent = (props: SurveysCardContentProps) => {
  const { surveys } = props;
  const { t } = useTranslation();

  return (
    <CardContent>
      <h4
        color="white"
        className="font-bold"
      >
        <p>{t('survey.sidebar')}</p>
        <img
          src={SurveyPageMenuIcon}
          alt="survey"
          width={BUTTONS_ICON_WIDTH}
        />
      </h4>
      <div className="mt-4 flex flex-col justify-between gap-6">
        {surveys.map((survey) => (
          <>{JSON.stringify(survey, null, 2)}</>
        ))}
      </div>
    </CardContent>
  );
};

export default SurveysCardContent;
