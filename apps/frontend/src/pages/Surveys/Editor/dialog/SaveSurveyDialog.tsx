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
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SaveSurveyDialogBody from '@/pages/Surveys/Editor/dialog/SaveSurveyDialogBody';
import CircleLoader from '@/components/ui/CircleLoader';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface SaveSurveyDialogProps {
  form: UseFormReturn<SurveyDto>;
  isOpenSaveSurveyDialog: boolean;
  setIsOpenSaveSurveyDialog: (state: boolean) => void;
  submitSurvey: () => void;
  isSubmitting: boolean;
  trigger?: React.ReactNode;
}

const SaveSurveyDialog = (props: SaveSurveyDialogProps) => {
  const { trigger, form, submitSurvey, isSubmitting, isOpenSaveSurveyDialog, setIsOpenSaveSurveyDialog } = props;

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isSubmitting) return <CircleLoader className="mx-auto" />;
    return <SaveSurveyDialogBody form={form} />;
  };

  const getFooter = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSurvey();
      }}
    >
      <Button
        type="submit"
        variant="btn-collaboration"
        disabled={isSubmitting}
        size="lg"
      >
        {t('common.save')}
      </Button>
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveSurveyDialog}
      trigger={trigger}
      handleOpenChange={() => setIsOpenSaveSurveyDialog(!isOpenSaveSurveyDialog)}
      title={t('surveys.saveDialog.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[50%] min-h-[500px] max-h-[90%] overflow-auto"
    />
  );
};

export default SaveSurveyDialog;
