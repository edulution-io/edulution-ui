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
import { v4 as uuidv4 } from 'uuid';
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';

const defaultDocOptions: IDocOptions = {
  compress: false,
};

interface ExportToPdfStore {
  surveySavePDF: (
    surveyFormula: SurveyFormula | JSON,
    surveyResults?: JSON,
    pdfDocOptions?: IDocOptions,
  ) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  isProcessing?: boolean;
  reset: () => void;
}

const ExportToPdfStoreInitialState: Partial<ExportToPdfStore> = {
  isOpen: false,
  isProcessing: false,
};

const useExportToPdfStore = create<ExportToPdfStore>((set) => ({
  ...(ExportToPdfStoreInitialState as ExportToPdfStore),
  reset: () => set(ExportToPdfStoreInitialState),

  setIsOpen: (isOpen: boolean) => set({ isOpen }),

  setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

  surveySavePDF: async (
    surveyFormula: SurveyFormula | JSON,
    surveyResults?: JSON,
    pdfDocOptions?: IDocOptions,
  ): Promise<void> => {
    set({ isProcessing: true });
    toast.info(t('survey.export.processing'));
    const surveyPdf = new SurveyPDF(surveyFormula, pdfDocOptions || defaultDocOptions);
    if (surveyResults) {
      surveyPdf.data = surveyResults;
    }
    try {
      await surveyPdf.save(`survey_-_${getCurrentDateTimeString()}_-_${uuidv4()}`);
      toast.success(t('survey.export.success'));
    } catch (error) {
      toast.error(t('survey.export.error'));
      console.error('Error during PDF export:', error);
    } finally {
      set({ isProcessing: false });
    }
  },
}));

export default useExportToPdfStore;
