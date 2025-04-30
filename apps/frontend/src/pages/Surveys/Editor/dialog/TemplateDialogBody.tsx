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

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import TemplateList from '@/pages/Surveys/Editor/dialog/TemplateList';
import { Button } from '@/components/shared/Button';
import Label from '@/components/ui/Label';

interface TemplateDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreator;
}

const TemplateDialogBody = (props: TemplateDialogBodyProps) => {
  const { form, surveyCreator } = props;
  const { setIsOpenTemplateMenu, templates, fetchTemplates, uploadTemplate } = useTemplateMenuStore();

  const { t } = useTranslation();

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const handleSaveTemplate = async () => {
    const values = form.getValues();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, formula, saveNo, creator, createdAt, expires, answers, ...remainingSurvey } = values;
    await uploadTemplate({ formula: surveyCreator.JSON as SurveyFormula, ...remainingSurvey });
    setIsOpenTemplateMenu(false);
  };

  return (
    <div className="space-y-2">
      <div className="my-0 mb-4 flex h-[32px] max-h-[32px] flex-row items-center justify-between py-0">
        <Label>
          <p className="font-bold">{t('survey.editor.templateMenu.submit')}</p>
        </Label>
        <Button
          onClick={handleSaveTemplate}
          variant="btn-collaboration"
          className="my-0 h-[32px] rounded py-0"
        >
          {t('common.save')}
        </Button>
      </div>

      <TemplateList
        form={form}
        creator={surveyCreator}
        templates={templates}
      />
    </div>
  );
};

export default TemplateDialogBody;
