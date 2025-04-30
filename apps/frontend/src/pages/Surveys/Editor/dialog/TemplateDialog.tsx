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
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TemplateDialogBody from '@/pages/Surveys/Editor/dialog/TemplateDialogBody';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface TemplateDialogProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;

  isOpenTemplateMenu: boolean;
  setIsOpenTemplateMenu: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const TemplateDialog = (props: TemplateDialogProps) => {
  const { trigger, form, creator, isOpenTemplateMenu, setIsOpenTemplateMenu } = props;

  const { t } = useTranslation();

  const getDialogBody = () => (
    <TemplateDialogBody
      form={form}
      surveyCreator={creator}
    />
  );

  const handleClose = () => setIsOpenTemplateMenu(!isOpenTemplateMenu);

  const getFooter = () => <DialogFooterButtons handleClose={handleClose} />;

  return (
    <AdaptiveDialog
      isOpen={isOpenTemplateMenu}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('survey.editor.templateMenu.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[50%] min-h-[200px] max-h-[90%] overflow-auto"
    />
  );
};

export default TemplateDialog;
