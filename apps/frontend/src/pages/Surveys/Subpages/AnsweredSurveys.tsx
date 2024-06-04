import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useShowSurveyResultsDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialogStore';
import useShowSurveyAnswerDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialogStore';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialog';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props';
// import useShowSurveyResultsTableDialogStore
//   from '@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/ShowSurveyResultsTableDialogStore';
import ShowSurveyResultsTableDialog
  from "@/pages/Surveys/Subpages/Dialogs/ShowResultsTable/ShowSurveyResultsTableDialog.tsx";

const AnsweredSurveysPage = () => {
  const {
    selectedSurvey,
    setSelectedSurvey,
    answeredSurveys,
    updateOpenSurveys,
    updateAnsweredSurveys,
    isFetchingAnsweredSurveys,
  } = useSurveysPageStore();
  // const { openSurveyResultsTableDialog } = useShowSurveyResultsTableDialogStore();
  const { openSurveyResultsDialog } = useShowSurveyResultsDialogStore();
  const { openSurveyAnswerDialog } = useShowSurveyAnswerDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!answeredSurveys || answeredSurveys.length === 0) {
      updateAnsweredSurveys();
    }
  }, []);

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          title={t('survey.answeredSurveys')}
          surveys={answeredSurveys}
          setSelectedSurvey={setSelectedSurvey}
          isLoading={isFetchingAnsweredSurveys}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          {selectedSurvey ? (
            <>
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
              {/* <FloatingActionButton */}
              {/*   icon={SurveyButtonProps.ResultingTable.icon} */}
              {/*   text={t(SurveyButtonProps.ResultingTable.title)} */}
              {/*   onClick={openSurveyResultsTableDialog} */}
              {/* /> */}
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
      {/* <ShowSurveyResultsTableDialog survey={selectedSurvey!} /> */}
      <ShowSurveyResultsDialog survey={selectedSurvey!} />
    </>
  );
};

export default AnsweredSurveysPage;
