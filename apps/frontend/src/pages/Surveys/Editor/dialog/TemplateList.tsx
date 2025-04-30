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
import TemplateItem from '@/pages/Surveys/Editor/dialog/TemplateItem';
import Label from '@/components/ui/Label';
import { AccordionSH } from '@/components/ui/AccordionSH';

interface TemplateListProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  templates: Partial<SurveyDto>[];
}

const TemplateList = (props: TemplateListProps) => {
  const { form, creator, templates } = props;
  const { t } = useTranslation();

  return (
    <>
      <Label>
        <p className="font-bold">{t('survey.editor.templateMenu.fetch')}</p>
      </Label>
      <AccordionSH
        type="multiple"
        className="px-4"
      >
        {templates.map((template: Partial<SurveyDto>) => (
          <TemplateItem
            key={`${uuidv4()}`}
            form={form}
            creator={creator}
            template={template}
          />
        ))}
      </AccordionSH>
    </>
  );
};

export default TemplateList;
