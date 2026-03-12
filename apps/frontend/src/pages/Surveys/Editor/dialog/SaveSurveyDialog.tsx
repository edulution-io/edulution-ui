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
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SaveSurveyDialogProps {
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  submitSurvey: () => void;
  isSubmitting: boolean;
  handleSaveTemplate: () => void;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const form = useFormContext<SurveyDto>();

  const { trigger, submitSurvey, isSubmitting, handleSaveTemplate, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } =
    props;

  const { t } = useTranslation();

  const getDialogBody = () => <SaveSurveyDialogBody />;

  const handleClose = () => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog);

  const getFooter = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (form.watch('shouldSaveAsTemplate')) {
          handleSaveTemplate();
        } else {
          submitSurvey();
        }
      }}
    >
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={() => {}}
        disableSubmit={isSubmitting}
        submitButtonText={form.watch('shouldSaveAsTemplate') ? 'survey.editor.template.save.submit' : 'common.save'}
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
