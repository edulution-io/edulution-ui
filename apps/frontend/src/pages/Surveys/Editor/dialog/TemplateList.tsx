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
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import TemplateItem from '@/pages/Surveys/Editor/dialog/TemplateItem';
import { AccordionSH } from '@/components/ui/AccordionSH';

interface TemplateListProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  templates: SurveyTemplateDto[];
}

const TemplateList = (props: TemplateListProps) => {
  const { form, creator, templates } = props;

  return (
    <AccordionSH
      type="multiple"
      className="px-4"
    >
      {templates.map((template: SurveyTemplateDto) => (
        <TemplateItem
          key={template.fileName}
          form={form}
          creator={creator}
          template={template}
        />
      ))}
    </AccordionSH>
  );
};

export default TemplateList;
