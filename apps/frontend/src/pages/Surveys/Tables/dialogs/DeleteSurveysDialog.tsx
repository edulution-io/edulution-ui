import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Button } from '@/components/shared/Button';
import DeleteItemDialogList from '@/components/shared/DeleteItemDialogList';
import CircleLoader from '@/components/ui/CircleLoader';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';

interface DeleteSurveysDialogProps {
  surveys: SurveyDto[];
  trigger?: React.ReactNode;
}

const DeleteSurveysDialog = ({ surveys, trigger }: DeleteSurveysDialogProps) => {
  const { selectedRows, setSelectedRows } = useSurveyTablesPageStore();
  const { isLoading, error, reset, isDeleteSurveysDialogOpen, setIsDeleteSurveysDialogOpen, deleteSurveys } =
    useDeleteSurveyStore();
  const { t } = useTranslation();

  const selectedSurveyIds = Object.keys(selectedRows);
  const selectedSurveys = surveys?.filter((survey) => selectedSurveyIds.includes(survey.id.toString('base64')));

  const isMultiDelete = selectedSurveyIds.length > 1;

  const onSubmit = () => {
    deleteSurveys(selectedSurveys);
    setSelectedRows({});
    setIsDeleteSurveysDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;

    return (
      <div className="text-foreground">
        {error ? (
          <>
            {t('common.error')}: {error.message}
          </>
        ) : (
          <DeleteItemDialogList
            deleteWarningTranslationId={isMultiDelete ? 'surveys.confirmMultiDelete' : 'surveys.confirmSingleDelete'}
            items={selectedSurveys.map((survey) => {
              const surveyId = survey.id.toString('base64');
              return {
                name: `${survey.formula.title} (id: ${surveyId})`,
                id: surveyId,
              };
            })}
          />
        )}
      </div>
    );
  };

  const getFooter = () =>
    !error ? (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          onClick={onSubmit}
        >
          {t('common.delete')}
        </Button>
      </div>
    ) : (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="lg"
          onClick={() => reset()}
        >
          {t('common.cancel')}
        </Button>
      </div>
    );

  return (
    <AdaptiveDialog
      isOpen={isDeleteSurveysDialogOpen}
      trigger={trigger}
      handleOpenChange={() => setIsDeleteSurveysDialogOpen(!isDeleteSurveysDialogOpen)}
      title={t(isMultiDelete ? 'surveys.deleteSurveys' : 'surveys.deleteSurvey', {
        count: selectedSurveys.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteSurveysDialog;
