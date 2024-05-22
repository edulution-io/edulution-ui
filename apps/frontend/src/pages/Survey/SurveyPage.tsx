import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTable from '@/pages/Survey/components/SurveyTable';
import CreateButton from '@/pages/Survey/components/CreateButton';
import ParticipateSurveyDialog from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialog';
import EditSurveyDialog from '@/pages/Survey/components/edit-dialog/EditSurveyDialog';
import SurveyResultsDialog from '@/pages/Survey/components/results-dialog/SurveyResultsDialog';

const SurveyPage = () => {
  const {
    surveys,
    getAllSurveys,
    openSurveys,
    getOpenSurveys,
    createdSurveys,
    getCreatedSurveys,
    answeredSurveys,
    getAnsweredSurveys,
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

      {openSurveys?.length > 1 ? (
        <>
          <h4>{`${t('survey.openSurveys')}`}</h4>
          <SurveyTable
            surveys={openSurveys}
            showParticipateButton
          />
        </>
      ) : null}

      {createdSurveys?.length > 1 ? (
        <>
          <h4>{`${t('survey.createdSurveys')}`}</h4>
          <SurveyTable
            surveys={createdSurveys}
            showEditSurveyButton
            showDeleteSurveyButton
            showLoadResultsButton
          />
        </>
      ) : null}

      {answeredSurveys?.length > 1 ? (
        <>
          <h4>{`${t('survey.answeredSurveys')}`}</h4>
          <SurveyTable
            surveys={answeredSurveys}
            showLoadResultsButton
          />
        </>
      ) : null}

      <h4>{`${t('survey.allSurveys')}`}</h4>
      <SurveyTable
        surveys={surveys}
        showDeleteSurveyButton
        showEditSurveyButton
        showParticipateButton
      />

      <CreateButton />

      <EditSurveyDialog />
      <ParticipateSurveyDialog />
      <SurveyResultsDialog />
    </>
  );
};
export default SurveyPage;
