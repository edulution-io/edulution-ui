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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface ExportSurveyToPdfDialogProps {
  formula: SurveyFormula;
  answer?: JSON;
  trigger?: React.ReactNode;
}

const ExportSurveyToPdfDialog = ({ formula, answer, trigger }: ExportSurveyToPdfDialogProps) => {
  const { isOpen, setIsOpen, isProcessing, saveSurveyAsPdf } = useExportSurveyToPdfStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isProcessing) return <CircleLoader className="mx-auto" />;
    return <p className="mb-4">{t('survey.export.warning')}</p>;
  };

  const onSubmit = async () => {
    await saveSurveyAsPdf(formula, answer);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="survey.export.saveInPDF"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('survey.export.saveInPDF')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ExportSurveyToPdfDialog;
