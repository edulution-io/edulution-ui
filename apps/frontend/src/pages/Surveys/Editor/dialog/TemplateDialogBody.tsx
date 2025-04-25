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
import { UseFormReturn } from 'react-hook-form';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import Label from '@/components/ui/Label';
import { Button } from '@/components/shared/Button';

interface SaveSurveyDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
}

const TemplateDialogBody = (props: SaveSurveyDialogBodyProps) => {
  const { form } = props;
  const { t } = useTranslation();

  const { templates } = useTemplateMenuStore();

  const handleLoadTemplate = (template: SurveyDto) => {
    const { formula /* , backendLimiter */ } = template;
    form.setValue('formula', formula);
    // form.setValue('backendLimiter', backendLimiter);
  };

  return (
    <>
      {templates.map((surveyDto: SurveyDto) => (
        <div
          key={surveyDto.formula.title}
          className="flex flex-col gap-2"
        >
          <Label>
            <p className="font-bold">{t('survey.editor.templateMenu.title')}</p>
          </Label>
          <p />
          <Button onClick={() => handleLoadTemplate(surveyDto)} />
        </div>
      ))}
    </>
  );
};

export default TemplateDialogBody;
