/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ItemDialogList from '@/components/shared/ItemDialogList';

interface DeleteSurveysDialogProps {
  surveys: SurveyDto[];
  trigger?: React.ReactNode;
}

const DeleteSurveysDialog = ({ surveys, trigger }: DeleteSurveysDialogProps) => {
  const { selectedRows, setSelectedRows, updateUsersSurveys } = useSurveyTablesPageStore();
  const { isLoading, error, reset, isDeleteSurveysDialogOpen, setIsDeleteSurveysDialogOpen, deleteSurveys } =
    useDeleteSurveyStore();
  const { t } = useTranslation();

  const selectedSurveyIds = Object.keys(selectedRows);
  // TODO: Issue 388: [REPORT] Survey - rework ids to only use the timestamps in the frontend
  const selectedSurveys = surveys?.filter((survey) => selectedSurveyIds.includes(survey.id.toString('base64')));

  const isMultiDelete = selectedSurveyIds.length > 1;

  const onSubmit = async () => {
    await deleteSurveys(selectedSurveys);
    await updateUsersSurveys();
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
          <ItemDialogList
            deleteWarningTranslationId={isMultiDelete ? 'surveys.confirmMultiDelete' : 'surveys.confirmSingleDelete'}
            items={selectedSurveys.map((survey) => ({
              // TODO: Issue 388: [REPORT] Survey - rework ids to only use the timestamps in the frontend
              name: `${survey.formula.title}`,
              id: survey.id.toString('base64'),
            }))}
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
