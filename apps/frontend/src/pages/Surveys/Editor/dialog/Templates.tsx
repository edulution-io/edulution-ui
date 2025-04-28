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
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import Template from '@/pages/Surveys/Editor/dialog/Template';
import Label from '@/components/ui/Label';

interface TemplatesProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  templates: SurveyDto[];
}

const Templates = (props: TemplatesProps) => {
  const { form, creator, templates } = props;
  const { t } = useTranslation();
  return (
    <>
      <Label>
        <p className="font-bold">{t('survey.editor.templateMenu.fetch')}</p>
      </Label>
      {templates.map((surveyDto: SurveyDto) => (
        <Template
          key={form.getValues('formula').title}
          form={form}
          creator={creator}
          template={surveyDto}
        />
      ))}
    </>
  );
};

export default Templates;
