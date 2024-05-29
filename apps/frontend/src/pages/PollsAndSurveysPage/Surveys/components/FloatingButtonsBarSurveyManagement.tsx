import React from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto';
import FloatingButtonCreateSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/floating-buttons/Create';
import FloatingButtonDeleteSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/floating-buttons/Delete';
import FloatingButtonEditSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/floating-buttons/Edit';
import FloatingButtonParticipateSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/floating-buttons/Participate';
import FloatingButtonOpenAnswerSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/floating-buttons/OpenAnswer';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';

interface FloatingButtonsBarSurveyManagementProps {
  selectedType: UsersSurveysTypes | undefined;
  setSelectedSurvey: (selectSurvey: Survey | undefined) => void;
  deleteSurvey: () => Promise<void>;
  openEditSurveyDialog: () => void;
  openParticipateSurveyDialog: () => void;
  openSurveyResultsDialog: () => void;

  shouldRefreshOpen?: (refresh: boolean) => void;
  shouldRefreshParticipated?: (refresh: boolean) => void;
  shouldRefreshCreated?: (refresh: boolean) => void;
  shouldRefreshGlobalList?: (refresh: boolean) => void;
}

const FloatingButtonsBarSurveyManagement = (props: FloatingButtonsBarSurveyManagementProps) => {
  const {
    selectedType,
    setSelectedSurvey,
    deleteSurvey,
    openEditSurveyDialog,
    openParticipateSurveyDialog,
    openSurveyResultsDialog,

    shouldRefreshOpen,
    shouldRefreshParticipated,
    shouldRefreshCreated,
    shouldRefreshGlobalList,
  } = props;

  const AddButton = (
    <FloatingButtonCreateSurvey
      setSelectedSurvey={setSelectedSurvey}
      openEditSurveyDialog={openEditSurveyDialog}
    />
  );

  const getOtherButtons = () => {
    switch (selectedType) {
      case UsersSurveysTypes.OPEN:
        return <FloatingButtonParticipateSurvey openParticipateSurveyDialog={openParticipateSurveyDialog} />;
      case UsersSurveysTypes.ALL:
      case UsersSurveysTypes.CREATED:
        return (
          <>
            <FloatingButtonParticipateSurvey openParticipateSurveyDialog={openParticipateSurveyDialog} />
            <FloatingButtonEditSurvey openEditSurveyDialog={openEditSurveyDialog} />
            <FloatingButtonDeleteSurvey
              deleteSurvey={deleteSurvey}
              shouldRefreshOpen={shouldRefreshOpen}
              shouldRefreshParticipated={shouldRefreshParticipated}
              shouldRefreshCreated={shouldRefreshCreated}
              shouldRefreshGlobalList={shouldRefreshGlobalList}
            />
          </>
        );
      case UsersSurveysTypes.ANSWERED:
        return <FloatingButtonOpenAnswerSurvey openSurveyResultsDialog={openSurveyResultsDialog} />;
      default:
        return null;
    }
  };
  const OtherButtons = getOtherButtons();

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
        {AddButton}
        {OtherButtons}
      </div>
    </TooltipProvider>
  );
};

export default FloatingButtonsBarSurveyManagement;
