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
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ItemDialogList from '@/components/shared/ItemDialogList';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface DeleteSurveysDialogProps {
  surveys: SurveyDto[];
  trigger?: React.ReactNode;
}

const DeleteSurveysDialog = ({ surveys, trigger }: DeleteSurveysDialogProps) => {
  const { selectedRows, setSelectedRows, updateUsersSurveys } = useSurveysTablesPageStore();
  const { isLoading, error, reset, isDeleteSurveysDialogOpen, setIsDeleteSurveysDialogOpen, deleteSurveys } =
    useDeleteSurveyStore();
  const { t } = useTranslation();

  const selectedSurveyIds = Object.keys(selectedRows);
  const selectedSurveys = surveys?.filter((survey) => selectedSurveyIds.includes(survey.id!));

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
        <ItemDialogList
          deleteWarningTranslationId={isMultiDelete ? 'surveys.confirmMultiDelete' : 'surveys.confirmSingleDelete'}
          items={selectedSurveys.map((survey) => ({
            name: `${survey.formula.title}`,
            id: survey.id!,
          }))}
        />
        {error ? (
          <>
            {t('common.error')}: {error.message}
          </>
        ) : null}
      </div>
    );
  };

  const handleClose = () => {
    setIsDeleteSurveysDialogOpen(false);
    reset();
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      disableSubmit={isLoading}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteSurveysDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(isMultiDelete ? 'surveys.deleteSurveys' : 'surveys.deleteSurvey', {
        count: selectedSurveys.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteSurveysDialog;
