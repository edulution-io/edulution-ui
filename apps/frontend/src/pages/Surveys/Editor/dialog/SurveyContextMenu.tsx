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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SurveyContextMenuBody from '@/pages/Surveys/Editor/dialog/SurveyContextMenuBody';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface SurveyContextMenuProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreatorModel;
  isOpenSurveyContextMenu: boolean;
  setIsOpenSurveyContextMenu: (state: boolean) => void;
  trigger?: React.ReactNode;
}

const SurveyContextMenu = (props: SurveyContextMenuProps) => {
  const { trigger, form, surveyCreator, isOpenSurveyContextMenu, setIsOpenSurveyContextMenu } = props;

  const { t } = useTranslation();

  const handleClose = () => setIsOpenSurveyContextMenu(!isOpenSurveyContextMenu);

  const body = (
    <SurveyContextMenuBody
      form={form}
      surveyCreator={surveyCreator}
    />
  );

  const footer = <DialogFooterButtons handleClose={handleClose} />;

  return (
    <AdaptiveDialog
      isOpen={isOpenSurveyContextMenu}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('surveys.saveDialog.title')}
      body={body}
      footer={footer}
      desktopContentClassName="max-w-[50%] min-h-[500px] max-h-[90%] overflow-auto"
    />
  );
};

export default SurveyContextMenu;
