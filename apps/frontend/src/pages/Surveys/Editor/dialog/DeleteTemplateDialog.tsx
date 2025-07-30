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
import { useTranslation } from 'react-i18next';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
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
  } = useTemplateMenuStore();

  const { t } = useTranslation();

  const handleRemoveTemplate = async () => {
    if (template?.fileName) {
      await deleteTemplate(template?.fileName);
      void fetchTemplates();
      setIsOpenTemplateConfirmDeletion(false);
    }
  };

  const getDialogBody = () => {
    if (isSubmitting) return <CircleLoader className="mx-auto mt-5" />;
    return <p>{t('survey.editor.templateMenu.deletion.message')}</p>;
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
      title={t('survey.editor.templateMenu.deletion.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="min-h-[100px]"
    />
  );
};

export default DeleteTemplateDialog;
