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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurveysSidebarIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useIsSurveysActive from '@/pages/Surveys/useIsSurveysActive';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import SurveysList from '@/pages/Dashboard/Feed/surveys/SurveysList';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';

const SurveysFeed = () => {
  const { openSurveys } = useSurveyTablesPageStore();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const isActive = useIsSurveysActive();
  if (!isActive || isSuperAdmin) {
    return null;
  }

  return (
    <AccordionItem value={APPS.SURVEYS}>
      <FeedWidgetAccordionTrigger
        src={SurveysSidebarIcon}
        alt={`${APPS.SURVEYS}-notification-icon`}
        labelTranslationId="surveys.sidebar"
      />
      <AccordionContent className="pb-2">
        {openSurveys.length > 0 ? (
          <SurveysList
            items={openSurveys}
            className="my-2"
          />
        ) : (
          <span className="my-2 text-center text-sm">{t('feed.noSurveys')}</span>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default SurveysFeed;
