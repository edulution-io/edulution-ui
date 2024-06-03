import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResults/ShowSurveyResultsDialog';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props.ts';

const OpenSurveysPage = () => {
  const {
    setSelectedSurvey,
    openSurveys,
    updateOpenSurveys,
    updateAnsweredSurveys,
    isFetchingOpenSurveys,
    selectedSurvey,
  } = useSurveysPageStore();
  const { openParticipateSurveyDialog } = useParticipateSurveyDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!openSurveys || openSurveys.length === 0) {
      updateOpenSurveys();
    }
  }, []);

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          title={t('survey.openSurveys')}
          surveys={openSurveys}
          setSelectedSurvey={setSelectedSurvey}
          isLoading={isFetchingOpenSurveys}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          {selectedSurvey ? (
            <FloatingActionButton
              icon={SurveyButtonProps.Participate.icon}
              text={t(SurveyButtonProps.Participate.title)}
              onClick={openParticipateSurveyDialog}
            />
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

export default OpenSurveysPage;
