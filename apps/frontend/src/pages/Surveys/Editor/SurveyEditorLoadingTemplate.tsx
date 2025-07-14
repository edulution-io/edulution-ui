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
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import { Card } from '@/components/shared/Card';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  template: SurveyTemplateDto;
  key?: string;
}

const SurveyEditorLoadingTemplate = ({ creator, template, key }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const { icon, title, description, isActive } = template;

  return (
    <Card
      key={key}
      className={cn(GRID_CARD, { 'bg-muted': isActive }, { 'bg-muted-transparent': !isActive })}
      variant="text"
      onClick={() => assignTemplateToSelectedSurvey(creator, template)}
    >
      <img
        src={icon}
        alt={title}
        className="h-10 w-10 md:h-14 md:w-14"
      />

      <p>{title}</p>

      <p>{description}</p>
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
