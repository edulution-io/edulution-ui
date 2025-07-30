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
import { HiTrash } from 'react-icons/hi';
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  template: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, template }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const { setTemplate, setIsOpenTemplateConfirmDeletion, setIsOpenTemplatePreview } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { title, description, disabled } = template;

  return (
    <Card
      className={cn(GRID_CARD, disabled ? 'bg-muted-transparent' : 'bg-muted', { 'pb-10': isSuperAdmin })}
      variant="text"
      onClick={() => {
        setTemplate(template);
        assignTemplateToSelectedSurvey(creator, template);
      }}
    >
      <Button
        variant="btn-outline"
        onClick={(e) => {
          e.stopPropagation();
          setTemplate(template);
          setIsOpenTemplatePreview(true);
        }}
        className="h-14 w-14 p-2"
      >
        <MdOutlineOpenInNew className="h-10 w-10" />
      </Button>
      <h4 aria-label={`Template title: ${title}`}>{title}</h4>
      <p>{description}</p>
      {isSuperAdmin && (
        <div className="flex w-full justify-end">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setTemplate(template);
              setIsOpenTemplateConfirmDeletion(true);
            }}
            variant="btn-attention"
            size="sm"
            className="p-2"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
