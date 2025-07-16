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
import { useTranslation } from 'react-i18next';
import { Model, Survey } from 'survey-react-ui';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import useLanguage from '@/hooks/useLanguage';
import surveyTheme from '@/pages/Surveys/theme/theme';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';

interface SurveyEditorLoadingPreviewProps {
  setOpenPreview: (isOpen: boolean) => void;
  surveyTemplateDto: SurveyTemplateDto;
}

const SurveyEditorLoadingPreview = ({ setOpenPreview, surveyTemplateDto }: SurveyEditorLoadingPreviewProps): JSX.Element => {
  const { t } = useTranslation();
  
  const { language } = useLanguage();

  const surveyParticipationModel = new Model(surveyTemplateDto.template.formula);
  surveyParticipationModel.applyTheme(surveyTheme);
  surveyParticipationModel.locale = language;
  if (surveyParticipationModel.pages.length > 3) {
    surveyParticipationModel.showProgressBar = 'top';
  }

  return (
    <ResizableWindow
      titleTranslationId={t('common.preview')}
      handleClose={() => setOpenPreview(false)}
      openMaximized={false}
      disableToggleMaximizeWindow
    >
      <div
        className="h-full w-full pb-10"
      >
        <div className="survey-participation">
          <Survey model={surveyParticipationModel} />
        </div>
      </div>
    </ResizableWindow>
  );
};

export default SurveyEditorLoadingPreview;