import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore';
import useParticipateSurveyDialogStore from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialogStore';
// import useShowSurveyResultsDialogStore
//   from '@/pages/Surveys/Subpages/Dialogs/ShowResults/ShowSurveyResultsDialogStore';
import useShowSurveyAnswerDialogStore
  from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialogStore';
import SurveyTable from '@/pages/Surveys/Subpages/components/table/SurveyTable';
import ParticipateSurveyDialog from '@/pages/Surveys/Subpages/Dialogs/Participate/ParticipateSurveyDialog';
import ShowSurveyAnswerDialog from '@/pages/Surveys/Subpages/Dialogs/ShowAnswer/ShowSurveyAnswerDialog';
import ShowSurveyResultsDialog from '@/pages/Surveys/Subpages/Dialogs/ShowResults/ShowSurveyResultsDialog';
import SurveyButtonProps from '@/pages/Surveys/Subpages/components/survey-button-props';

const CreatedSurveysPage = () => {
  const {
    setSelectedSurvey,
    createdSurveys,
    updateCreatedSurveys,
    isFetchingCreatedSurveys,
    setPageViewSurveyEditor,
    selectedSurvey,
    deleteSurvey,
    updateOpenSurveys,
    updateAnsweredSurveys,
    updateAllSurveys,
  } = useSurveysPageStore();
  const { openParticipateSurveyDialog } = useParticipateSurveyDialogStore();
  // const { openSurveyResultsDialog } = useShowSurveyResultsDialogStore();
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
          setSelectedSurvey={setSelectedSurvey}
          isLoading={isFetchingCreatedSurveys}
        />
      </ScrollArea>
      <TooltipProvider>
        <div className="fixed bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
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
                icon={SurveyButtonProps.Answer.icon}
                text={t(SurveyButtonProps.Answer.title)}
                onClick={openSurveyAnswerDialog}
              />
              {/* TODO: FIX This view somehow it got broken (data.forEach is not a function) */}
              {/*<FloatingActionButton*/}
              {/*  icon={SurveyButtonProps.Results.icon}*/}
              {/*  text={t(SurveyButtonProps.Results.title)}*/}
              {/*  onClick={openSurveyResultsDialog}*/}
              {/*/>*/}
              <FloatingActionButton
                icon={SurveyButtonProps.Delete.icon}
                text={t(SurveyButtonProps.Delete.title)}
                onClick={async () => {
                  await deleteSurvey(selectedSurvey?.surveyname!);
                  await updateOpenSurveys();
                  await updateCreatedSurveys();
                  await updateAnsweredSurveys();
                  await updateAllSurveys();
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
