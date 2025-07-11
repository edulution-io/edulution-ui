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
import SEARCH_INPUT_LABEL from '@libs/ui/constants/launcherSearchInputLabel';
import useLanguage from '@/hooks/useLanguage';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';

import Input from '@/components/shared/Input';
import { Card } from '@/components/shared/Card';
import useUserStore from '@/store/UserStore/useUserStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
const SurveyEditorLoadingPage = () => {
  const { templates, fetchTemplates } = useTemplateMenuStore();

  const { user } = useUserStore();
  const surveyCreator: AttendeeDto | undefined = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      value: user?.username || '',
      label: `${user?.firstName} ${user?.lastName}` || '',
    }),
    [user],
  );

  const { assignTemplateToSelectedSurvey } = useSurveysTablesPageStore();

  const { language } = useLanguage();

  const { t } = useTranslation();

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
        className="mx-auto my-3 block w-[80%] min-w-[250px] rounded-xl border border-ring bg-none px-3 py-2 md:mb-2 md:mt-0 md:w-[400px]"
      />
      <div
        className="mx-auto grid max-h-[full] w-full grid-cols-[repeat(auto-fit,minmax(8rem,auto))] justify-center
        gap-x-3 gap-y-2 overflow-auto pb-10 scrollbar-thin md:max-h-full
        md:w-[95%] md:grid-cols-[repeat(auto-fit,minmax(12rem,auto))] md:gap-x-6 md:gap-y-5 md:pb-4"
      >
        <Card
          className={cn(
            'h-26 relative flex w-full flex-col items-center overflow-hidden border border-muted-light bg-muted-dialog p-5 hover:bg-primary',
            'bg-muted',
          )}
          variant="text"
          onClick={() => assignTemplateToSelectedSurvey(surveyCreator, undefined)}
        >
          <VscNewFile className="h-10 w-10 md:h-14 md:w-14" />
          <p>{t('survey.editor.new')}</p>
        </Card>

        {templates.length ? (
          templates.map((template, index) => (
            <Card
              key={index}
              className={cn(
                'h-26 relative flex w-full flex-col items-center overflow-hidden border border-muted-light bg-muted-dialog p-5 hover:bg-primary',
                'bg-muted',
              )}
              variant="text"
              onClick={() => assignTemplateToSelectedSurvey(surveyCreator, template)}
            >
              <img
                src={template.icon}
                alt={template.title}
                className="h-10 w-10 md:h-14 md:w-14"
              />

              <p>{template.title}</p>

              <p>{template.description}</p>
            </Card>
          ))
        ) : (
          <div className="py-16">{t('launcher.noSearchResults')}</div>
        )}
      </div>
    </>
  );
};

export default SurveyEditorLoadingPage;
