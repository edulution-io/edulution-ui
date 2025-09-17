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
import { v4 as uuidv4 } from 'uuid';
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';

const defaultOptions: IDocOptions = {
  compress: true,
};

const surveySavePDF = (surveyFormula: SurveyFormula | JSON, surveyResults?: JSON, pdfDocOptions?: IDocOptions) => {
  const surveyPdf = new SurveyPDF(surveyFormula, pdfDocOptions || defaultOptions);
  if (surveyResults) {
    surveyPdf.data = surveyResults;
  }
  try {
    void surveyPdf.save(`survey_-_${getCurrentDateTimeString()}_-_${uuidv4()}`);
    toast.success(t('survey.export.success'));
  } catch (error) {
    toast.error(t('survey.export.error'));
    console.error('Error during PDF export:', error);
  }
};

export default surveySavePDF;
