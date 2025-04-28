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
import { v4 as uuidv4 } from 'uuid';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import TemplateDto from '@libs/survey/types/api/template.dto';
import Template from '@/pages/Surveys/Editor/dialog/Template';
import Label from '@/components/ui/Label';
import { AccordionSH } from '@/components/ui/AccordionSH';

interface TemplatesProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  templates: TemplateDto[];
}

const Templates = (props: TemplatesProps) => {
  const { form, creator, templates } = props;
  const { t } = useTranslation();

  return (
    <>
      <Label>
        <p className="font-bold">{t('survey.editor.templateMenu.fetch')}</p>
      </Label>
      <AccordionSH type="single">
        {templates.map((templateDto: TemplateDto) => (
          <Template
            key={`${templateDto.fileName}-${uuidv4()}`}
            form={form}
            creator={creator}
            template={templateDto}
          />
        ))}
      </AccordionSH>
    </>
  );
};

export default Templates;
