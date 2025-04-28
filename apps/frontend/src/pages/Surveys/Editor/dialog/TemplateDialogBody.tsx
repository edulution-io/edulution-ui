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

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import Templates from '@/pages/Surveys/Editor/dialog/Templates';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import Label from '@/components/ui/Label';

interface SaveSurveyDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreator;
}

const TemplateDialogBody = (props: SaveSurveyDialogBodyProps) => {
  const { form, surveyCreator } = props;
  const { templates, fetchTemplates, uploadTemplate } = useTemplateMenuStore();

  const { t } = useTranslation();

  const [newTemplateName, setNewTemplateName] = useState<string>('');

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    const values = form.getValues();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { creator, ...remainingSurvey } = values;
    await uploadTemplate(newTemplateName, remainingSurvey);
  };

  return (
    <>
      <Label>
        <p className="font-bold">{t('survey.editor.templateMenu.submit')}</p>
      </Label>

      <Input
        value={newTemplateName}
        onChange={(e) => setNewTemplateName(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          className="my-0 h-[32px] py-0"
          onClick={handleSaveTemplate}
          disabled={!newTemplateName}
          variant="btn-outline"
        >
          {t('common.save')}
        </Button>
      </div>

      <Templates
        form={form}
        creator={surveyCreator}
        templates={templates}
      />
    </>
  );
};

export default TemplateDialogBody;
