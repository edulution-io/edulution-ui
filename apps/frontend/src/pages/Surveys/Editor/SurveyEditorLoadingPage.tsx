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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VscNewFile } from 'react-icons/vsc';
import cn from '@libs/common/utils/className';
import isSubsequence from '@libs/common/utils/string/isSubsequence';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SEARCH_INPUT_LABEL from '@libs/ui/constants/launcherSearchInputLabel';
import { GRID_CARD, GRID_SEARCH } from '@libs/ui/constants/commonClassNames';
import useLanguage from '@/hooks/useLanguage';
import useUserStore from '@/store/UserStore/useUserStore';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import SurveyEditorLoadingTemplate from '@/pages/Surveys/Editor/SurveyEditorLoadingTemplate';
import Input from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';

const SurveyEditorLoadingPage = () => {
  const { user } = useUserStore();
  const creator: AttendeeDto | undefined = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      value: user?.username || '',
      label: `${user?.firstName} ${user?.lastName}` || '',
    }),
    [user],
  );

  const { language } = useLanguage();
  const { t } = useTranslation();

  const { templates, fetchTemplates, setTemplate } = useTemplateMenuStore();

  const { assignTemplateToSelectedSurvey } = useSurveyEditorPageStore();

  const [search, setSearch] = useState('');

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const searchString = search.trim().toLowerCase();
    if (!searchString) return templates;

    return templates.filter((template) => {
      const name = template.title?.toLowerCase();

      return isSubsequence(searchString, name || '');
    });
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
          className={cn(GRID_CARD, 'flex items-center justify-center bg-muted')}
          variant="text"
          onClick={() => {
            setTemplate(undefined);
            assignTemplateToSelectedSurvey(creator, undefined);
          }}
        >
          <VscNewFile className="h-10 w-10 md:h-14 md:w-14" />
          <p>{t('survey.editor.new')}</p>
        </Card>

        {filteredTemplates.length ? (
          filteredTemplates.map((template) => (
            <div key={template.fileName} className="relative">
              <SurveyEditorLoadingTemplate
                creator={creator}
                template={template}
              />
            </div>
          ))
        ) : (
          <div className="py-16">{t('survey.editor.noSearchResults')}</div>
        )}
      </div>
    </>
  );
};

export default SurveyEditorLoadingPage;
