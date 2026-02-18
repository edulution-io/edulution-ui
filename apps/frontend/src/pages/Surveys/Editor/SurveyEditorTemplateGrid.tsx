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
import cn from '@libs/common/utils/className';
import AttendeeDto from '@libs/user/types/attendee.dto';
import isSubsequence from '@libs/common/utils/string/isSubsequence';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import SurveyEditorTemplateCard from '@/pages/Surveys/Editor/SurveyEditorTemplateCard';
import SurveyEditorTemplatePreview from '@/pages/Surveys/Editor/SurveyEditorTemplatePreview';
import Input from '@/components/shared/Input';

interface SurveyEditorTemplateGridProps {
  surveyCreator: AttendeeDto;
}

const SurveyEditorTemplateGrid = ({ surveyCreator }: SurveyEditorTemplateGridProps) => {
  const { t } = useTranslation();

  const { templates, fetchTemplates, isOpenTemplatePreview } = useSurveyTemplateStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!templates || templates.length === 0) {
      return [];
    }
    let filtered: SurveyTemplateDto[] = [];
    const searchString = search.trim().toLowerCase();
    if (!searchString) {
      filtered = templates;
    } else {
      filtered = templates.filter((surveyTemplate) =>
        isSubsequence(
          searchString,
          surveyTemplate.name?.toLowerCase() || surveyTemplate.template.formula.title.toLowerCase() || '',
        ),
      );
    }
    filtered.sort((a, b) => {
      if (a.isActive && !b.isActive) {
        return -1;
      }
      if (!a.isActive && b.isActive) {
        return 1;
      }
      const aName = a.name?.toLowerCase() || a.template.formula.title.toLowerCase() || '';
      const bName = b.name?.toLowerCase() || b.template.formula.title.toLowerCase() || '';
      return aName.localeCompare(bName);
    });
    return filtered;
  }, [templates, search]);

  return (
    <>
      <Input
        placeholder={t('survey.editor.template.searchPlaceholder')}
        aria-label={t('survey.editor.template.searchPlaceholder')}
        value={search}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        variant="default"
        width="auto"
        className="mt-1"
      />
      <div className={cn('space-2 flex w-full flex-wrap gap-2 overflow-y-auto pb-2 scrollbar-thin')}>
        <SurveyEditorTemplateCard
          key="create-new-card"
          creator={surveyCreator}
          surveyTemplate={undefined}
        />
        {filteredTemplates.length ? (
          filteredTemplates.map((surveyTemplate) => (
            <SurveyEditorTemplateCard
              key={`survey-template-card_${surveyTemplate.name || surveyTemplate.template.formula.title}`}
              creator={surveyCreator}
              surveyTemplate={surveyTemplate}
            />
          ))
        ) : (
          <p className="px-2 py-24">
            {templates.length === 0
              ? t('survey.editor.template.noTemplates')
              : t('survey.editor.template.noSearchResults')}
          </p>
        )}
      </div>
      {isOpenTemplatePreview && <SurveyEditorTemplatePreview />}
    </>
  );
};

export default SurveyEditorTemplateGrid;
