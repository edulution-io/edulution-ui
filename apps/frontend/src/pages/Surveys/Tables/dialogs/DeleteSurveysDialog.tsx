/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useDeleteSurveyStore from '@/pages/Surveys/Tables/dialogs/useDeleteSurveyStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ItemDialogList from '@/components/shared/ItemDialogList';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

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
