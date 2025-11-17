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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface ExportToPdfWarningProps {
  formula: SurveyFormula;
  answer?: JSON;
  trigger?: React.ReactNode;
}

const ExportSurveyToPdfDialog = ({ formula, answer, trigger }: ExportToPdfWarningProps) => {
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
