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
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface SaveSurveyDialogProps {
  form: UseFormReturn<SurveyDto>;
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  submitSurvey: () => void;
  isSubmitting: boolean;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const { trigger, form, submitSurvey, isSubmitting, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } = props;

  const { t } = useTranslation();

  const getDialogBody = () => <SaveSurveyDialogBody form={form} />;

  const handleClose = () => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog);

  const getFooter = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSurvey();
      }}
    >
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={() => {}}
        disableSubmit={isSubmitting}
        submitButtonText="common.save"
        submitButtonType="submit"
      />
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('surveys.saveDialog.title')}
      body={!isSubmitting && getDialogBody()}
      footer={!isSubmitting && getFooter()}
      desktopContentClassName="max-w-[50%] min-h-[500px] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
