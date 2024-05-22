import React, { useEffect } from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import SurveyTable from '@/pages/Survey/components/SurveyTable';
import ParticipateSurveyDialog from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialog';
import EditSurveyDialog from '@/pages/Survey/components/edit-dialog/EditSurveyDialog';
import SurveyResultsDialog from '@/pages/Survey/components/results-dialog/SurveyResultsDialog';
import FloatingButtonsBarSurveyManagement from '@/pages/Survey/components/FloatingButtonsBarSurveyManagement';
import UserSurveyTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';

const SurveyPage = () => {
  const {
    getAllSurveys,
    openSurveys,
    getOpenSurveys,
    createdSurveys,
    getCreatedSurveys,
    answeredSurveys,
    getAnsweredSurveys,
    setSelectedSurvey,
    setSelectedSurveyType,
    shouldRefresh,
    setShouldRefresh,
    isLoading,
    error,
  } = useSurveyStore();

  useEffect(() => {
    const fetchSurveys = async () => {
      const promises = [getAllSurveys(), getOpenSurveys(), getCreatedSurveys(), getAnsweredSurveys()];
      await Promise.all(promises).catch((e) => console.error(e));
    };
    if (!shouldRefresh) {
      return;
    }

    setSelectedSurvey(undefined);
    setSelectedSurveyType(undefined);
    setShouldRefresh(false);

    fetchSurveys().catch((e) => console.error(e));
  }, [shouldRefresh]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}

      {openSurveys?.length > 1 ? <SurveyTable surveyType={UserSurveyTypes.OPEN} /> : null}

      {createdSurveys?.length > 1 ? <SurveyTable surveyType={UserSurveyTypes.CREATED} /> : null}

      {answeredSurveys?.length > 1 ? <SurveyTable surveyType={UserSurveyTypes.ANSWERED} /> : null}

      <SurveyTable surveyType={UserSurveyTypes.ALL} />

      <EditSurveyDialog />
      <ParticipateSurveyDialog />
      <SurveyResultsDialog />

      <FloatingButtonsBarSurveyManagement />
    </>
  );
};
export default SurveyPage;
