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
import { MdOutlineOpenInNew } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Card } from '@/components/shared/Card';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, surveyTemplate }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const { setTemplate } = useTemplateMenuStore();

  const { template } = surveyTemplate;
  const { formula } = template;
  const { title, description } = formula;

  return (
    <Card
      className={cn(GRID_CARD, 'bg-muted')}
      variant="text"
      onClick={() => {
        setTemplate(surveyTemplate);
        assignTemplateToSelectedSurvey(creator, surveyTemplate);
      }}
    >
      <MdOutlineOpenInNew className="h-10 w-10 md:h-14 md:w-14" />

      <p>{title}</p>

      <p>{description}</p>
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
