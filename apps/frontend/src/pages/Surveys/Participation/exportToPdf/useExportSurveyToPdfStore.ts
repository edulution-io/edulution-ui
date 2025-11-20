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

import { t } from 'i18next';
import { toast } from 'sonner';
import { create } from 'zustand';
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';

const defaultDocOptions: IDocOptions = {
  compress: false,
};

interface ExportSurveyToPdfStore {
  saveSurveyAsPdf: (surveyFormula: SurveyFormula, surveyResults?: JSON, pdfDocOptions?: IDocOptions) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  isProcessing?: boolean;
  reset: () => void;
}

const initialState: Partial<ExportSurveyToPdfStore> = {
  isOpen: false,
  isProcessing: false,
};

const useExportSurveyToPdfStore = create<ExportSurveyToPdfStore>((set) => ({
  ...(initialState as ExportSurveyToPdfStore),
  reset: () => set(initialState),

  setIsOpen: (isOpen: boolean) => set({ isOpen }),

  saveSurveyAsPdf: async (
    surveyFormula: SurveyFormula,
    surveyResults?: JSON,
    pdfDocOptions?: IDocOptions,
  ): Promise<void> => {
    set({ isProcessing: true });

    toast.info(t('survey.export.processing'), { id: 'processing-export-survey-to-pdf' });

    const surveyPdf = new SurveyPDF(surveyFormula, pdfDocOptions || defaultDocOptions);

    if (surveyResults) {
      surveyPdf.data = surveyResults;
    }

    try {
      const normalizedTitle = surveyFormula.title.replace(/[-_.]/g, '').trim().toLowerCase();
      await surveyPdf.save(`survey-${normalizedTitle}-${getCurrentDateTimeString()}`);
      toast.dismiss('processing-export-survey-to-pdf');
      toast.success(t('survey.export.success'));
    } catch (error) {
      toast.dismiss('processing-export-survey-to-pdf');
      toast.error(t('survey.export.error'));
      console.error('Error during PDF export:', error);
    } finally {
      set({ isProcessing: false });
    }
  },
}));

export default useExportSurveyToPdfStore;
