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
