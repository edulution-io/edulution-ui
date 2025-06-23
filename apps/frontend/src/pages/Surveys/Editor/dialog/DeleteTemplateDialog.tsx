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
import UserLanguage from '@libs/user/constants/userLanguage';
import useUserStore from '@/store/UserStore/UserStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import Input from '@/components/shared/Input';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import Label from '@/components/ui/Label';

interface DeleteTemplateDialogProps {
  isOpenTemplateConfirmDeletion: boolean;
  setIsOpenTemplateConfirmDeletion: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const DeleteTemplateDialog = (props: DeleteTemplateDialogProps) => {
  const { isOpenTemplateConfirmDeletion, setIsOpenTemplateConfirmDeletion, trigger } = props;

  const { template, error, isSubmitting, deleteTemplate, fetchTemplates } = useTemplateMenuStore();

  const { user } = useUserStore();

  const { t } = useTranslation();

  const locale = getLocaleDateFormat(user?.language === UserLanguage.SYSTEM ? navigator.language : user?.language);

  const handleRemoveTemplate = async () => {
    if (template?.fileName) {
      await deleteTemplate(template?.fileName);
      void fetchTemplates();
      setIsOpenTemplateConfirmDeletion(false);
    }
  };

  const getDialogBody = () => {
    if (isSubmitting) return <CircleLoader className="mx-auto mt-5" />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('survey.editor.templateMenu.deletion.error')}: {error.message}
          </>
        ) : (
          <div className="text-background">
            <p>{t('survey.editor.templateMenu.deletion.message')}</p>
            <div className="mx-8 mt-2 space-y-2">
              {template?.template.formula?.title && (
                <p className="inline-flex w-full items-center">
                  <Label className="mr-4 inline-block min-w-[80px] font-bold text-background">
                    {t('common.title')}:
                  </Label>
                  <Input
                    type="text"
                    value={template?.template.formula?.title}
                    readOnly
                    disabled
                    useFullWidth
                    className="min-w-[100px] cursor-pointer"
                  />
                </p>
              )}
              {template?.template.creator && (
                <p className="inline-flex w-full items-center">
                  <Label className="mr-4 inline-block min-w-[80px] font-bold">{t('common.creator')}:</Label>
                  <Input
                    type="text"
                    value={template?.template.creator.username}
                    readOnly
                    disabled
                    useFullWidth
                    className="min-w-[100px] cursor-pointer"
                  />
                </p>
              )}
              {template?.template.createdAt && (
                <p className="inline-flex w-full items-center">
                  <Label className="mr-4 inline-block min-w-[80px] font-bold">{t('common.createdAt')}:</Label>
                  <Input
                    type="text"
                    value={format(template?.template.createdAt, 'PPP', { locale })}
                    readOnly
                    disabled
                    useFullWidth
                    className="min-w-[100px] cursor-pointer"
                  />
                </p>
              )}
            </div>
          </div>
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
