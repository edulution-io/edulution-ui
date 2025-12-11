/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
      ) : (
        <TemplateList
          form={form}
          creator={surveyCreator}
          templates={templates}
        />
      )}
    </div>
  );
};

export default TemplateDialogBody;
