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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SaveSurveyDialogProps {
  form: UseFormReturn<SurveyDto>;
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const { form, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } = props;

  const { t } = useTranslation();

  const getDialogBody = () => <SaveSurveyDialogBody form={form} />;

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      handleOpenChange={() => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog)}
      title={t('surveys.saveDialog.title')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[50%] min-h-[500px] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
