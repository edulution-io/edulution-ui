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
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const DeleteTemplateDialog = () => {
  const {
    template,
    isSubmitting,
    deleteTemplate,
    fetchTemplates,
    isOpenTemplateConfirmDeletion,
    setIsOpenTemplateConfirmDeletion,
  } = useSurveyTemplateStore();

  const { t } = useTranslation();

  const handleRemoveTemplate = async () => {
    if (template?.id) {
      await deleteTemplate(template?.id);
      void fetchTemplates();
      setIsOpenTemplateConfirmDeletion(false);
    }
  };

  const getDialogBody = () => {
    if (isSubmitting) return <CircleLoader className="mx-auto mt-5" />;
    return <p>{t('survey.editor.template.deletion.message')}</p>;
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={() => setIsOpenTemplateConfirmDeletion(false)}
      handleSubmit={handleRemoveTemplate}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenTemplateConfirmDeletion}
      handleOpenChange={() => setIsOpenTemplateConfirmDeletion(!isOpenTemplateConfirmDeletion)}
      title={t('survey.editor.template.deletion.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteTemplateDialog;
