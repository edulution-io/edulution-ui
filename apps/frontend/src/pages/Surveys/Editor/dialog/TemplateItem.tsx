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
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import PropertyDialogList from '@/components/shared/PropertyDialogList';

interface TemplateItemProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  surveyTemplateDto: SurveyTemplateDto;
}

const TemplateItem = (props: TemplateItemProps) => {

  const { setTemplate } = useTemplateMenuStore();

  const { form, creator, surveyTemplateDto } = props;

  const {
    template,
    backendLimiters,
    fileName,
    title,
    description,
    isActive,
    createdAt,
    updatedAt,
    icon,
  } = surveyTemplateDto;

  // const {
  //   formula,
  //   backendLimiters: surveysBackendLimiters,
  //   invitedAttendees: surveyInvitedAttendees,
  //   invitedGroups: surveyInvitedGroups,
  //   isAnonymous: surveyIsAnonymous,
  //   isPublic: surveyIsPublic,
  //   canSubmitMultipleAnswers: surveyCanSubmitMultipleAnswers,
  //   canUpdateFormerAnswer: surveyCanUpdateFormerAnswer,
  // } = template;
  
  // const {
  //   title: surveyTitle,
  // } = formula || {};

  const propertyList = [
    { id: 'title', value: title, translationId: 'common.title' },
    { id: 'description', value: description, translationId: 'common.description' },
    { id: 'isActive', value: isActive ? 'Yes' : 'No', translationId: 'common.is-active' },
    { id: 'icon', value: icon, translationId: 'common.icon' },
  ];

  return (
    <PropertyDialogList
      deleteWarningTranslationId="survey.editor.templateMenu.deletion.message"
      items={propertyList}
    />
  );
};

export default TemplateItem;
