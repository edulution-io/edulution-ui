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
    if (template?.fileName) {
      await deleteTemplate(template?.fileName);
      void fetchTemplates();
      setIsOpenTemplateConfirmDeletion(false);
    }
  };

  const propertyList = [
    { id: 'title', value: template?.template.formula?.title, translationId: 'common.title' },
    { id: 'creator', value: template?.template.creator?.username, translationId: 'common.creator' },
    {
      id: 'createdAt',
      value: template?.template.createdAt ? format(template?.template.createdAt, 'PPP', { locale }) : '',
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
