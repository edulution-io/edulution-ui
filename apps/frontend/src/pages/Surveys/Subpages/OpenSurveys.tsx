import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResultsVisualization/ShowSurveyResultsDialog';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey.ts';

interface OpenSurveysPageProps {
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (survey: Survey | undefined) => void;
  openSurveys: Survey[];
  isFetchingOpenSurveys: boolean;
  updateOpenSurveys: () => void;
  updateAnsweredSurveys: () => void;
}

const OpenSurveysPage = (props: OpenSurveysPageProps) => {
  const {
    setSelectedSurvey,
    openSurveys,
    updateOpenSurveys,
    updateAnsweredSurveys,
    isFetchingOpenSurveys,
    selectedSurvey,
  } = props;

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
