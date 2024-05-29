import React from 'react';
import { useTranslation } from 'react-i18next';
import SurveySection from '@/pages/PollsAndSurveysPage/Surveys/components/SurveySection.tsx';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto.ts';
import FloatingButtonsBarSurveyManagement
  from '@/pages/PollsAndSurveysPage/Surveys/components/FloatingButtonsBarSurveyManagement';
import useSurveyPageStore from '@/pages/PollsAndSurveysPage/Surveys/SurveyPageStore';
import EditSurveyDialog from '@/pages/PollsAndSurveysPage/Surveys/dialogs/create-edit-survey/EditSurveyDialog';
import ParticipateSurveyDialog
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/participate-survey/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog
  from '@/pages/PollsAndSurveysPage/Surveys/dialogs/show-submitted-answer/ShowSurveyAnswerDialog.tsx';
import { ScrollArea } from '@/components/ui/ScrollArea';

const SurveyPage = () => {
  const { t } = useTranslation();

  const {
    selectedSurvey,
    setSelectedSurvey,
    selectedType,
    updateSurveySelection,
    deleteSurvey,
    isOpenEditSurveyDialog,
    openEditSurveyDialog,
    closeEditSurveyDialog,
    isOpenParticipateSurveyDialog,
    openParticipateSurveyDialog,
    closeParticipateSurveyDialog,
    isOpenSurveyResultsDialog,
    openSurveyResultsDialog,
    closeSurveyResultsDialog,
    refreshOpen,
    shouldRefreshOpen,
    refreshCreated,
    shouldRefreshCreated,
    refreshParticipated,
    shouldRefreshParticipated,
    refreshGlobalList,
    shouldRefreshGlobalList,
  } = useSurveyPageStore();

  return (
    <>
      <ScrollArea className="max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <SurveySection
          surveyType={UsersSurveysTypes.OPEN}
          title={t('survey.openSurveys')}
          updateSurveySelection={updateSurveySelection}
          shouldRefresh={refreshOpen}
        />
        <SurveySection
          surveyType={UsersSurveysTypes.CREATED}
          title={t('survey.createdSurveys')}

          updateSurveySelection={updateSurveySelection}
          shouldRefresh={refreshCreated}
        />
        <SurveySection
          surveyType={UsersSurveysTypes.ANSWERED}
          title={t('survey.answeredSurveys')}

          updateSurveySelection={updateSurveySelection}
          shouldRefresh={refreshParticipated}
        />
         <SurveySection
           surveyType={UsersSurveysTypes.ALL}
           title={t('survey.allSurveys')}
           updateSurveySelection={updateSurveySelection}
           shouldRefresh={refreshGlobalList}
         />
      </ScrollArea>
      <EditSurveyDialog
        survey={selectedSurvey}
        isOpenEditSurveyDialog={isOpenEditSurveyDialog}
        openEditSurveyDialog={openEditSurveyDialog}
        closeEditSurveyDialog={closeEditSurveyDialog}
      />
      <ParticipateSurveyDialog
        survey={selectedSurvey!}
        isParticipateSurveyDialogOpen={isOpenParticipateSurveyDialog}
        openParticipateSurveyDialog={openParticipateSurveyDialog}
        closeParticipateSurveyDialog={closeParticipateSurveyDialog}
        shouldRefreshOpen={shouldRefreshOpen}
        shouldRefreshParticipated={shouldRefreshParticipated}
      />
      <ShowSurveyAnswerDialog
        survey={selectedSurvey!}
        isOpenSurveyResultsDialog={isOpenSurveyResultsDialog}
        openSurveyResultsDialog={openSurveyResultsDialog}
        closeSurveyResultsDialog={closeSurveyResultsDialog}
      />

      {/* Buttons */}
      <FloatingButtonsBarSurveyManagement
        selectedType={selectedType}
        deleteSurvey={deleteSurvey}
        setSelectedSurvey={setSelectedSurvey}
        openEditSurveyDialog={openEditSurveyDialog}
        openParticipateSurveyDialog={openParticipateSurveyDialog}
        openSurveyResultsDialog={openSurveyResultsDialog}

        shouldRefreshOpen={shouldRefreshOpen}
        shouldRefreshParticipated={shouldRefreshParticipated}
        shouldRefreshCreated={shouldRefreshCreated}
        shouldRefreshGlobalList={shouldRefreshGlobalList}
      />
    </>
  );
}

export default SurveyPage;
