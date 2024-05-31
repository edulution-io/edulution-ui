import React from 'react';
import { useTranslation } from 'react-i18next'
import {
  AiOutlineDownSquare,
  AiOutlinePlusSquare,
  AiOutlineUpload,
  AiOutlineSave,
  AiOutlineUpSquare,
} from 'react-icons/ai';
import { FiDelete, FiEdit } from 'react-icons/fi';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { PageView } from '@/pages/Surveys/components/types/page-view';
import AnsweredSurveysPage from '@/pages/Surveys/Subpages/AnsweredSurveys';
import CreatedSurveysPage from '@/pages/Surveys/Subpages/CreatedSurveys';
import OpenSurveysPage from '@/pages/Surveys/Subpages/OpenSurveys';
import SurveyManagement from '@/pages/Surveys/Subpages/SurveyManagement';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import usePropagateSurveyDialogStore from '@/pages/Surveys/Dialogs/Propagate/PropagateSurveyDialogStore';
import ParticipateSurveyDialog from "@/pages/Surveys/Dialogs/Participate/ParticipateSurveyDialog";
import useParticipateSurveyDialogStore from '@/pages/Surveys/Dialogs/Participate/ParticipateSurveyDialogStore';
import ShowSurveyResultsDialog from '@/pages/Surveys/Dialogs/show-survey-results/ShowSurveyResultsDialog';
import useShowSurveyResultsDialogStore
  from '@/pages/Surveys/Dialogs/show-survey-results/ShowSurveyResultsDialogStore';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Dialogs/show-submitted-answer/ShowSurveyAnswerDialog';
import PropagateSurveyDialog from '@/pages/Surveys/Dialogs/Propagate/PropagateSurveyDialog';
import useShowSurveyAnswerDialogStore
  from '@/pages/Surveys/Dialogs/show-submitted-answer/ShowSurveyAnswerDialogStore';
import EditSurvey from "@/pages/Surveys/Subpages/EditSurvey.tsx";
import CreateSurvey from "@/pages/Surveys/Subpages/CreateSurvey.tsx";

const SurveysPage = () => {
  const {
    selectedPageView,
    setPageViewSurveyCreator,
    setPageViewSurveyEditor,
    selectedSurvey,
    setSelectedSurvey,
    patchSurvey,
    isPosting,
    deleteSurvey,
    updateOpenSurveys,
    updateCreatedSurveys,
    updateAnsweredSurveys,
    updateAllSurveys,
  } = useSurveysPageStore();
  const { openParticipateSurveyDialog } = useParticipateSurveyDialogStore();
  const { openPropagateSurveyDialog } = usePropagateSurveyDialogStore();
  const { openSurveyResultsDialog } = useShowSurveyResultsDialogStore();
  const { openSurveyAnswerDialog } = useShowSurveyAnswerDialogStore();

  const { t } = useTranslation();

  const getBody = (): React.ReactNode => {
    switch (selectedPageView) {
      case PageView.OPEN_SURVEYS:
        return <OpenSurveysPage/>;
      case PageView.CREATED_SURVEYS:
        return <CreatedSurveysPage/>;
      case PageView.ANSWERED_SURVEYS:
        return <AnsweredSurveysPage/>;
      case PageView.SURVEY_CREATOR:
        return <CreateSurvey
          surveyName={selectedSurvey?.surveyname}
          surveyFormula={selectedSurvey?.survey}
          isPosting={isPosting}
          setSelectedSurvey={setSelectedSurvey}
        />;
      case PageView.SURVEY_EDITOR:
        return <EditSurvey />;
      case PageView.MANAGE_SURVEYS:
         return <SurveyManagement/>
      default:
        return <OpenSurveysPage/>;
    }
  }

  const getButtons = () => {
    switch (selectedPageView) {
      case PageView.OPEN_SURVEYS:
        return (
          <>
            <FloatingActionButton
              icon={AiOutlinePlusSquare}
              text={t('survey.create')}
              onClick={setPageViewSurveyCreator}
            />
            { selectedSurvey ? (
              <FloatingActionButton
                icon={AiOutlineUpSquare}
                text={t('survey.participate')}
                onClick={openParticipateSurveyDialog}
              />
            ) : null }
          </>
        );
      case PageView.CREATED_SURVEYS:
        return (
          <>
            <FloatingActionButton
              icon={AiOutlinePlusSquare}
              text={t('survey.create')}
              onClick={setPageViewSurveyCreator}
            />
            { selectedSurvey ? (
              <>
                <FloatingActionButton
                  icon={AiOutlineUpSquare}
                  text={t('survey.participate')}
                  onClick={openParticipateSurveyDialog}
                />
                <FloatingActionButton
                  icon={FiEdit}
                  text={t('survey.edit')}
                  onClick={setPageViewSurveyEditor}
                />
                <FloatingActionButton
                  icon={AiOutlineDownSquare}
                  text={t('survey.answer')}
                  onClick={openSurveyAnswerDialog}
                />
                <FloatingActionButton
                  icon={AiOutlineDownSquare}
                  text={t('survey.result')}
                  onClick={openSurveyResultsDialog}
                />
                <FloatingActionButton
                  icon={FiDelete}
                  text={t('survey.delete')}
                  onClick={() => {
                    deleteSurvey(selectedSurvey?.surveyname!);
                    updateOpenSurveys();
                    updateCreatedSurveys();
                    updateAnsweredSurveys();
                    updateAllSurveys();
                  }}
                />
              </>
            ) : null }
          </>
        );
      case PageView.ANSWERED_SURVEYS:
        return (
          <>
            <FloatingActionButton
              icon={AiOutlinePlusSquare}
              text={t('survey.create')}
              onClick={setPageViewSurveyCreator}
            />
            { selectedSurvey ? (
              <>
                <FloatingActionButton
                  icon={AiOutlineDownSquare}
                  text={t('survey.answer')}
                  onClick={openSurveyAnswerDialog}
                />
                <FloatingActionButton
                  icon={AiOutlineDownSquare}
                  text={t('survey.result')}
                  onClick={openSurveyResultsDialog}
                />
              </>
            ) : null }
          </>
        );
      case PageView.SURVEY_CREATOR:
      case PageView.SURVEY_EDITOR:
        return (
          <>
            <FloatingActionButton
              icon={AiOutlineSave}
              text={t('save')}
              onClick={() => patchSurvey(selectedSurvey!)}
            />
            <FloatingActionButton
              icon={AiOutlineUpload}
              text={t('survey.propagate')}
              onClick={openPropagateSurveyDialog}
            />
          </>
        );
      case PageView.MANAGE_SURVEYS:
        return (
          <>
            <FloatingActionButton
              icon={AiOutlinePlusSquare}
              text={t('survey.create')}
              onClick={setPageViewSurveyCreator}
            />
            { selectedSurvey ? (
              <>
                <FloatingActionButton
                  icon={AiOutlineUpSquare}
                  text={t('survey.participate')}
                  onClick={openParticipateSurveyDialog}
                />
                <FloatingActionButton
                  icon={FiEdit}
                  text={t('survey.edit')}
                  onClick={setPageViewSurveyEditor}
                />
                <FloatingActionButton
                  icon={FiDelete}
                  text={t('survey.delete')}
                  onClick={() => {
                    deleteSurvey(selectedSurvey?.surveyname!);
                    updateOpenSurveys();
                    updateCreatedSurveys();
                    updateAnsweredSurveys();
                    updateAllSurveys();
                  }}
                />
              </>
            ) : null }
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        { getBody() }
      </ScrollArea>

      <ParticipateSurveyDialog
        survey={selectedSurvey!}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
      />
      <PropagateSurveyDialog
        survey={selectedSurvey!}
      />
      <ShowSurveyAnswerDialog survey={selectedSurvey!} />
      <ShowSurveyResultsDialog
        survey={selectedSurvey!}
      />

      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          { getButtons() }
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveysPage;
