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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscNewFile } from 'react-icons/vsc';
import cn from '@libs/common/utils/className';
import isSubsequence from '@libs/common/utils/string/isSubsequence';
import SEARCH_INPUT_LABEL from '@libs/ui/constants/launcherSearchInputLabel';
import getCreatorFromUserDto from '@libs/survey/utils/getCreatorFromUserDto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { GRID_CARD, GRID_SEARCH } from '@libs/ui/constants/commonClassNames';
import useUserStore from '@/store/UserStore/useUserStore';
import useLanguage from '@/hooks/useLanguage';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import Input from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import SurveyEditorLoadingTemplate from '@/pages/Surveys/Editor/SurveyEditorLoadingTemplate';

const SurveyEditorLoadingPage = () => {
  const { user } = useUserStore();
  const surveyCreator: AttendeeDto | undefined = useMemo(() => getCreatorFromUserDto(user), [user]);

  const { language } = useLanguage();
  const { t } = useTranslation();

  const { templates, fetchTemplates } = useTemplateMenuStore();

  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const searchString = search.trim().toLowerCase();
    if (!searchString) return templates;
    return templates.filter((surveyTemplate) => isSubsequence(searchString, surveyTemplate.name?.toLowerCase() || ''));
  }, [templates, language, search]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.getAttribute('aria-label') === SEARCH_INPUT_LABEL) {
        event.preventDefault();
      }
    },
    [filteredTemplates],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <Input
        placeholder={t(SEARCH_INPUT_LABEL)}
        aria-label={SEARCH_INPUT_LABEL}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        variant="default"
        width="auto"
        className={GRID_SEARCH}
      />
      <div className="mx-auto grid max-h-full w-full grid-cols-[repeat(auto-fit,minmax(8rem,auto))] justify-center gap-x-3 gap-y-2 overflow-auto px-2 pb-10 scrollbar-thin md:max-h-full md:w-[95%] md:grid-cols-[repeat(auto-fit,minmax(12rem,auto))] md:gap-x-6 md:gap-y-5 md:pb-4">
        <Card
          className={cn(GRID_CARD, 'bg-muted')}
          variant="text"
          onClick={() => assignTemplateToSelectedSurvey(surveyCreator, undefined)}
        >
          <VscNewFile className="h-10 w-10 md:h-14 md:w-14" />
          <p>{t('survey.editor.new')}</p>
        </Card>

        {filteredTemplates.length ? (
          filteredTemplates.map((template) => (
            <div key={template.name}>
              <SurveyEditorLoadingTemplate
                creator={surveyCreator}
                surveyTemplate={template}
              />
            </div>
          ))
        ) : (
          <p className="px-2 py-16">{t('survey.editor.noSearchResults')}</p>
        )}
      </div>
    </>
  );
};

export default SurveyEditorLoadingPage;
