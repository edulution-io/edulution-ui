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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscNewFile } from 'react-icons/vsc';
import { EyeDarkIcon } from '@/assets/icons';
import isSubsequence from '@libs/common/utils/string/isSubsequence';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import SurveyEditorTemplateCard from '@/pages/Surveys/Editor/SurveyEditorTemplateCard';
import Input from '@/components/shared/Input';

interface SurveyEditorTemplateGridProps {
  surveyCreator: AttendeeDto;
}

const SurveyEditorTemplateGrid = ({ surveyCreator }: SurveyEditorTemplateGridProps) => {
  const { t } = useTranslation();

  const { templates, fetchTemplates, setTemplate } = useTemplateMenuStore();

  const { loadNewSurvey, loadSurveyTemplate } = useSurveyEditorPageStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const searchString = search.trim().toLowerCase();
    if (!searchString) return templates;
    return templates.filter((surveyTemplate) => isSubsequence(searchString, surveyTemplate.name?.toLowerCase() || ''));
  }, [templates, search]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <>
      <Input
        placeholder={t('survey.editor.searchPlaceholder')}
        aria-label={t('survey.editor.searchPlaceholder')}
        value={search}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        onKeyDown={handleKeyDown}
        variant="default"
        width="auto"
      />
      <div className="mx-auto mt-4 grid max-h-full w-full grid-cols-[repeat(auto-fit,minmax(8rem,auto))] gap-x-3 gap-y-2 overflow-auto px-2 pb-10 scrollbar-thin md:max-h-full md:w-[95%] md:grid-cols-[repeat(auto-fit,minmax(12rem,auto))] md:gap-x-6 md:gap-y-5 md:pb-4">
        <SurveyEditorTemplateCard
          key="create-new-card"
          icon={VscNewFile}
          title={t('survey.editor.new')}
          onClick={() => {
            setTemplate(undefined);
            loadNewSurvey(surveyCreator);
          }}
        />
        {filteredTemplates.length ? (
          filteredTemplates.map((surveyTemplate) => (
            <SurveyEditorTemplateCard
              key={surveyTemplate.template.formula.title}
              icon={EyeDarkIcon}
              title={surveyTemplate.template.formula.title}
              description={surveyTemplate.template.formula.description}
              onClick={() => {
                setTemplate(surveyTemplate);
                loadSurveyTemplate(surveyCreator, surveyTemplate);
              }}
            />
          ))
        ) : (
          <p className="px-2 py-16">
            {templates.length === 0 ? t('survey.editor.noTemplates') : t('survey.editor.noSearchResults')}
          </p>
        )}
      </div>
    </>
  );
};

export default SurveyEditorTemplateGrid;
