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
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import useLanguage from '@/hooks/useLanguage';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import PropertyDialogList from '@/components/shared/PropertyDialogList';

interface DeleteTemplateDialogProps {
  isOpenTemplateConfirmDeletion: boolean;
  setIsOpenTemplateConfirmDeletion: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const DeleteTemplateDialog = (props: DeleteTemplateDialogProps) => {
  const { isOpenTemplateConfirmDeletion, setIsOpenTemplateConfirmDeletion, trigger } = props;

  const { template, error, isSubmitting, deleteTemplate, fetchTemplates } = useTemplateMenuStore();

  const { language } = useLanguage();

  const { t } = useTranslation();

  const locale = getLocaleDateFormat(language);

  const handleRemoveTemplate = async () => {
    if (template?.id) {
      await deleteTemplate(template?.id);
      void fetchTemplates();
      setIsOpenTemplateConfirmDeletion(false);
    }
  };

  const propertyList = [
    { id: 'title', value: template?.template?.formula?.title, translationId: 'common.title' },
    { id: 'creator', value: template?.template?.creator?.username, translationId: 'common.creator' },
    {
      id: 'createdAt',
      value: template?.template?.createdAt ? format(template?.template?.createdAt, 'PPP', { locale }) : '',
      translationId: 'common.createdAt',
    },
  ];

  const getDialogBody = () => {
    if (isSubmitting) return <CircleLoader className="mx-auto mt-5" />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('survey.editor.templateMenu.deletion.error')}: {error.message}
          </>
        ) : (
          <PropertyDialogList
            deleteWarningTranslationId="survey.editor.templateMenu.deletion.message"
            items={propertyList}
          />
        )}
      </div>
    );
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
      trigger={trigger}
      handleOpenChange={() => setIsOpenTemplateConfirmDeletion(!isOpenTemplateConfirmDeletion)}
      title={t('survey.editor.templateMenu.deletion.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteTemplateDialog;
