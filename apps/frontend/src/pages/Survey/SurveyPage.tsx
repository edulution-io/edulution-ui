import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTableOpenSurveys from '@/pages/Survey/Forms/Table/SurveyTableOpenSurveys';
import SurveyTableCreatedSurveys from '@/pages/Survey/Forms/Table/SurveyTableCreatedSurveys';
import SurveyTable from '@/pages/Survey/Forms/Table/SurveyTable';

const SurveyPage = () => {
  const {
    surveys,
    getAllSurveys,
    getOpenSurveys,
    getCreatedSurveys,
    getAnsweredSurveys,
    deleteSurvey,
    selectedSurvey,
    setSelectedSurvey,
    isLoading,
    error,
  } = useSurveyStore();

  const { t } = useTranslation();

  useEffect(() => {
    const fetchSurveys = async () => {
      const promises = [getAllSurveys(), getOpenSurveys(), getCreatedSurveys(), getAnsweredSurveys()];
      await Promise.all(promises).catch((e) => console.error(e));
    };

    fetchSurveys().catch((e) => console.error(e));

    return () => {
      setSelectedSurvey(undefined);
    };
  }, []);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}

      <h2>{`${t('survey.poll.title')}/${t('survey.forms.title')}`}</h2>

      <h4>{`${t('survey.forms.openSurveys')}`}</h4>
      <SurveyTableOpenSurveys />
      <h4>{`${t('survey.forms.createdSurveys')}`}</h4>
      <SurveyTableCreatedSurveys />
      <h4>{`${t('survey.forms.allSurveys')}`}</h4>
      <SurveyTable
        surveys={surveys}
        setSelectedSurvey={setSelectedSurvey}
        deleteSurvey={deleteSurvey}
        showDeleteButton
        showEditButton
        showOpenButton
      />

      {selectedSurvey ? (
        <div>
          <h4>{`${t('Preview')}`}</h4>
          <div className="m-4 flex-1 text-sm text-muted-foreground text-white">
            <span>{JSON.stringify(selectedSurvey, null, 2)}</span>
          </div>
        </div>
      ) : (
        <div className="m-4 flex-1 text-sm text-muted-foreground text-white">&nbsp;</div>
      )}
    </>
  );
};

export default SurveyPage;
