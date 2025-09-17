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
import { SurveyCreatorModel } from 'survey-creator-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import QuestionsContextMenuBody from '@/pages/Surveys/Editor/dialog/QuestionsContextMenuBody';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface QuestionsContextMenuProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreatorModel;
  isOpenQuestionContextMenu: boolean;
  setIsOpenQuestionContextMenu: (state: boolean) => void;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

const QuestionsContextMenu = (props: QuestionsContextMenuProps) => {
  const { form, trigger, isOpenQuestionContextMenu, setIsOpenQuestionContextMenu, creator, isLoading } = props;

  const { t } = useTranslation();

  const getDialogBody = () => (
    <QuestionsContextMenuBody
      form={form}
      creator={creator}
    />
  );

  const handleClose = () => setIsOpenQuestionContextMenu(!isOpenQuestionContextMenu);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      cancelButtonText="common.close"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenQuestionContextMenu}
      trigger={trigger}
      handleOpenChange={() => setIsOpenQuestionContextMenu(!isOpenQuestionContextMenu)}
      title={t('survey.editor.questionSettings.title')}
      body={!isLoading && getDialogBody()}
      footer={!isLoading && getFooter()}
      desktopContentClassName="w-[50%] max-w-[600px] min-w-[350px] max-h-[90%] overflow-auto"
    />
  );
};

export default QuestionsContextMenu;
