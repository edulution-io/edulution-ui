import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import SurveyEditorForm from '@/pages/Surveys/Editor/SurveyEditorForm';

const SurveysPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');

  const renderPage = () => {
    switch (page) {
      case 'editor':
        return <SurveyEditorForm />;
      default:
        return (
          <div className="flex flex-col justify-between">
            <p>{page}</p>
            <h2>{t('surveys.title')}</h2>
            <div className="pt-5 sm:pt-0">
              <p className="pb-4">{t('surveys.description')}</p>
            </div>
          </div>
        );
    }
  };

  return renderPage();
};

export default SurveysPage;
