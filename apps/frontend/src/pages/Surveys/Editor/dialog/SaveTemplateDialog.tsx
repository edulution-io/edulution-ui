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

import React, { useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import resetSurveyIdFromFormulasBackendLimiters from '@libs/survey/utils/resetSurveyIdFromFormulasBackendLimiters';
import useLdapGroups from '@/hooks/useLdapGroups';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSaveTemplateDialogStore from '@/pages/Surveys/Editor/dialog/useSaveTemplateDialogStore';
import SaveTemplateDialogBody from '@/pages/Surveys/Editor/dialog/SaveTemplateDialogBody';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface TemplateDialogProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  trigger?: React.ReactNode;
}

const SaveTemplateDialog: React.FC<TemplateDialogProps> = ({ form, creator, trigger }) => {
  const {
    name,
    accessGroups,
    uploadTemplate,
    setIsOpenSaveTemplateDialog,
    isOpenSaveTemplateDialog,
    setInitialData,
    reset,
  } = useSaveTemplateDialogStore();

  const { template } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { t } = useTranslation();

  useEffect(() => {
    setInitialData(template);
  }, [template, setInitialData]);

  const handleOpenChange = useCallback(() => {
    setIsOpenSaveTemplateDialog(!isOpenSaveTemplateDialog);
  }, [isOpenSaveTemplateDialog, setIsOpenSaveTemplateDialog]);

  const handleClose = useCallback(() => {
    setIsOpenSaveTemplateDialog(false);
  }, [setIsOpenSaveTemplateDialog]);

  const handleSaveTemplate = useCallback(async () => {
    const values = form.getValues();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, formula, createdAt, saveNo, expires, answers, ...remainingSurvey } = values;

    const creationDate = template?.template.createdAt || new Date();

    const rawFormula = creator.JSON as SurveyFormula;
    const processedFormula: SurveyFormula = resetSurveyIdFromFormulasBackendLimiters(rawFormula, id);

    await uploadTemplate({
      ...template,
      name,
      accessGroups,
      template: {
        ...remainingSurvey,
        formula: processedFormula,
        createdAt: creationDate,
      },
    });
    reset();
  }, [form, creator, template, name, accessGroups, uploadTemplate, handleClose]);

  const body = <SaveTemplateDialogBody />;

  const footer = (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={isSuperAdmin ? handleSaveTemplate : undefined}
      submitButtonText={t('survey.editor.saveTemplate.submit')}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveTemplateDialog}
      trigger={trigger}
      handleOpenChange={handleOpenChange}
      title={t('survey.editor.saveTemplate.title')}
      body={body}
      footer={footer}
      desktopContentClassName="max-w-[50%] min-h-[200px] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveTemplateDialog;
