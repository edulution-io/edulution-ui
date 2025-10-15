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

import { t } from 'i18next';
import { toast } from 'sonner';
import { create } from 'zustand';
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';
import sanitizeFilename from '@libs/common/utils/sanitizeFilename';

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
      await surveyPdf.save(`survey-${sanitizeFilename(surveyFormula.title)}-${getCurrentDateTimeString()}`);
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
