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
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import { GRID_CARD } from '@libs/ui/constants/commonClassNames';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

interface SurveyEditorLoadingTemplateProps {
  creator: AttendeeDto;
  surveyTemplate: SurveyTemplateDto;
}

const SurveyEditorLoadingTemplate = ({ creator, surveyTemplate }: SurveyEditorLoadingTemplateProps): JSX.Element => {
  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const {
    setTemplate,
    setIsOpenTemplateConfirmDeletion,
    setIsOpenTemplatePreview,
    toggleIsTemplateActive,
    fetchTemplates,
  } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { template, isActive = true } = surveyTemplate;
  const { formula } = template;
  const { title, description } = formula;

  return (
    <Card
      className={cn(GRID_CARD, { 'bg-accent': isActive }, { 'bg-card': !isActive }, { 'pb-12': isSuperAdmin })}
      variant="text"
      onClick={() => {
        setTemplate(surveyTemplate);
        assignTemplateToSelectedSurvey(creator, surveyTemplate);
      }}
    >
      <Button
        variant="btn-outline"
        onClick={(e) => {
          e.stopPropagation();
          setTemplate(surveyTemplate);
          setIsOpenTemplatePreview(true);
        }}
        className="h-14 w-14 p-2"
      >
        <MdOutlineOpenInNew className="h-10 w-10" />
      </Button>
      <h4 aria-label={`Template title: ${title}`}>{title}</h4>
      <p>{description}</p>
      {isSuperAdmin && (
        <>
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              if (!surveyTemplate.fileName) return;
              await toggleIsTemplateActive(surveyTemplate.fileName);
              await fetchTemplates();
            }}
            variant="btn-outline"
            size="sm"
            className="absolute bottom-2 right-14 h-8 w-10 p-2"
          >
            <img
              src={isActive ? EyeLightIcon : EyeLightSlashIcon}
              alt="eye"
              className="h-6 min-h-6 w-6 min-w-6"
            />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setTemplate(surveyTemplate);
              setIsOpenTemplateConfirmDeletion(true);
            }}
            variant="btn-outline"
            size="sm"
            className="absolute bottom-2 right-2 h-8 w-10 p-2"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </>
      )}
    </Card>
  );
};

export default SurveyEditorLoadingTemplate;
