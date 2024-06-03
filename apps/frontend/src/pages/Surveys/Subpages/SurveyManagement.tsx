import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResults/ShowSurveyResultsDialog';
import SurveyButtonProps from "@/pages/Surveys/Subpages/components/survey-button-props.ts";

const SurveyManagement = () => {
  const {
    setSelectedSurvey,
    allSurveys,
    selectedSurvey,
    isFetchingAllSurveys,
    setPageViewSurveyEditor,
    deleteSurvey,
    updateAllSurveys,
    updateOpenSurveys,
    updateCreatedSurveys,
    updateAnsweredSurveys,
  } = useSurveysPageStore();
  const { openParticipateSurveyDialog } = useParticipateSurveyDialogStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (!allSurveys || allSurveys.length === 0) {
      updateAllSurveys();
    }
  }, []);

  return (
    <>
      <ScrollArea className="overflow-y-auto overflow-x-hidden">
        <SurveyTable
          title={t('survey.allSurveys')}
          surveys={allSurveys}
          setSelectedSurvey={setSelectedSurvey}
          isLoading={isFetchingAllSurveys}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <>
            {selectedSurvey ? (
              <>
                <FloatingActionButton
                  icon={SurveyButtonProps.Participate.icon}
                  text={t(SurveyButtonProps.Participate.title)}
                  onClick={openParticipateSurveyDialog}
                />
                <FloatingActionButton
                  icon={SurveyButtonProps.Edit.icon}
                  text={t(SurveyButtonProps.Edit.title)}
                  onClick={setPageViewSurveyEditor}
                />
                <FloatingActionButton
                  icon={SurveyButtonProps.Delete.icon}
                  text={t(SurveyButtonProps.Delete.title)}
                  onClick={() => {
                    deleteSurvey(selectedSurvey?.surveyname!);
                    updateOpenSurveys();
                    updateCreatedSurveys();
                    updateAnsweredSurveys();
                    updateAllSurveys();
                  }}
                />
              </>
            ) : null}
          </>
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

export default SurveyManagement;
