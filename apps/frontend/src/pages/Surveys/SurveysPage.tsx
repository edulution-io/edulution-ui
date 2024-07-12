import React from 'react';
import { useSearchParams } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import SurveysManagement from '@/pages/Surveys/Tables/SurveysManagement';
import OpenSurveys from '@/pages/Surveys/Tables/OpenSurveys';
import AnsweredSurveys from '@/pages/Surveys/Tables/AnsweredSurveys';
import CreatedSurveys from '@/pages/Surveys/Tables/CreatedSurveys';
import SurveyEditorPage from '@/pages/Surveys/Editor/SurveyEditorPage';

const SurveysPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');

  // const navigate = useNavigate();
  const onClickEdit = () => {
    // navigate('/surveys/?page=editor');
    setSearchParams({ page: 'editor' });
  };

  const renderPage = () => {
    switch (page) {
      // case 'management':
      //   return <SurveysManagement/>
      case 'open':
        return <OpenSurveys />;
      case 'answered':
        return <AnsweredSurveys />;
      case 'created':
        return <CreatedSurveys edit={onClickEdit} />;
      case 'editor':
        return <SurveyEditorPage />;
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
