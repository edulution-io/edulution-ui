import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
import useShowSurveyResultsDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialogStore';
import useShowSurveyAnswerDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialogStore';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialog';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import useShowSurveyResultsTableDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/ShowSurveyResultsTableDialogStore';

interface CreatedSurveysPageProps {
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (survey: Survey | undefined) => void;
  createdSurveys: Survey[];
  updateCreatedSurveys: () => void;
  isFetchingCreatedSurveys: boolean;
  setPageViewSurveyEditor: () => void;
  deleteSurvey: (surveyname: string) => void;
  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;
}

const CreatedSurveysPage = (props: CreatedSurveysPageProps) => {
  const {
    selectedSurvey,
    setSelectedSurvey,
    createdSurveys,
    updateCreatedSurveys,
    isFetchingCreatedSurveys,
    setPageViewSurveyEditor,
    deleteSurvey,
    updateOpenSurveys,
    updateAnsweredSurveys,
  } = props;

  const { openSurveyResultsTableDialog } = useShowSurveyResultsTableDialogStore();
  const { openParticipateSurveyDialog } = useParticipateSurveyDialogStore();
  const { openSurveyResultsDialog } = useShowSurveyResultsDialogStore();
  const { openSurveyAnswerDialog } = useShowSurveyAnswerDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!createdSurveys || createdSurveys.length === 0) {
      updateCreatedSurveys();
    }
  }, []);

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          title={t('survey.createdSurveys')}
          surveys={createdSurveys}
          selectedSurvey={selectedSurvey}
          setSelectedSurvey={setSelectedSurvey}
          isLoading={isFetchingCreatedSurveys}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          {selectedSurvey ? (
            <>
              <FloatingActionButton
                icon={SurveyButtonProps.Edit.icon}
                text={t(SurveyButtonProps.Edit.title)}
                onClick={setPageViewSurveyEditor}
              />
              <FloatingActionButton
                icon={SurveyButtonProps.Participate.icon}
                text={t(SurveyButtonProps.Participate.title)}
                onClick={openParticipateSurveyDialog}
              />
              <FloatingActionButton
                icon={SurveyButtonProps.Answer.icon}
                text={t(SurveyButtonProps.Answer.title)}
                onClick={openSurveyAnswerDialog}
              />
              <FloatingActionButton
                icon={SurveyButtonProps.ResultingPanel.icon}
                text={t(SurveyButtonProps.ResultingPanel.title)}
                onClick={openSurveyResultsDialog}
              />
              <FloatingActionButton
                icon={SurveyButtonProps.ResultingTable.icon}
                text={t(SurveyButtonProps.ResultingTable.title)}
                onClick={openSurveyResultsTableDialog}
              />
              <FloatingActionButton
                icon={SurveyButtonProps.Delete.icon}
                text={t(SurveyButtonProps.Delete.title)}
                onClick={async () => {
                  await deleteSurvey(selectedSurvey?.surveyname!);
                  await updateOpenSurveys();
                  await updateCreatedSurveys();
                  await updateAnsweredSurveys();
                }}
              />
            </>
          ) : null}
        </div>
      </TooltipProvider>
      <ParticipateSurveyDialog
        survey={selectedSurvey!}
        updateOpenSurveys={updateOpenSurveys}
        updateAnsweredSurveys={updateAnsweredSurveys}
      />
      <ShowSurveyAnswerDialog survey={selectedSurvey!} />
      <ShowSurveyResultsDialog survey={selectedSurvey!} />
    </>
  );
};

export default CreatedSurveysPage;
