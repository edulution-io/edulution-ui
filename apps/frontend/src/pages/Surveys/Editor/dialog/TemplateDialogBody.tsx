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
import useLdapGroups from '@/hooks/useLdapGroups';

interface TemplateDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
  surveyCreator: SurveyCreator;
}

const TemplateDialogBody = (props: TemplateDialogBodyProps) => {
  const { form, surveyCreator } = props;
  const { templates, fetchTemplates, isLoading } = useTemplateMenuStore();

  const { t } = useTranslation();

  const { isSuperAdmin } = useLdapGroups();

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

  return (
    <div className="space-y-2">
      <p className="mb-4 flex justify-start">
        {isSuperAdmin ? t('survey.editor.templateMenu.adminMessage') : t('survey.editor.templateMenu.userMessage')}
      </p>
      {templates.length === 0 ? (
        <p className="flex justify-center text-secondary">{t('survey.editor.templateMenu.emptyMessage')}</p>
      ) : null}
      <TemplateList
        form={form}
        creator={surveyCreator}
        templates={templates}
      />
    </div>
  );
};

export default TemplateDialogBody;
