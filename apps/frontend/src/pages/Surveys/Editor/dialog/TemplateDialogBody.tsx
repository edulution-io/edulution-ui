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
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import TemplateList from '@/pages/Surveys/Editor/dialog/TemplateList';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface TemplateDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreator;
}

const TemplateDialogBody = (props: TemplateDialogBodyProps) => {
  const { form, surveyCreator } = props;
  const { templates, fetchTemplates, isLoading } = useTemplateMenuStore();

  const { t } = useTranslation();

  useEffect(() => {
    void fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center ">
        <CircleLoader />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="relative top-1/3">
        <p className="flex justify-center">{t('survey.editor.templateMenu.emptyMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <TemplateList
        form={form}
        creator={surveyCreator}
        templates={templates}
      />
    </div>
  );
};

export default TemplateDialogBody;
