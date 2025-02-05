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
import { ConferencesIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import ConferencesList from '@/pages/Dashboard/Feed/conferences/ConferencesList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useIsConferenceActive from '@/pages/ConferencePage/useIsConferenceActive';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';

const ConferencesFeed = () => {
  const { runningConferences } = useConferenceStore();

  const { t } = useTranslation();

  const isActive = useIsConferenceActive();
  if (!isActive) {
    return null;
  }

  return (
    <AccordionItem value={APPS.CONFERENCES}>
      <FeedWidgetAccordionTrigger
        src={ConferencesIcon}
        alt={`${APPS.CONFERENCES}-notification-icon`}
        labelTranslationId="conferences.sidebar"
      />
      <AccordionContent className="pb-2">
        {runningConferences.length > 0 ? (
          <ConferencesList
            items={runningConferences}
            className="my-2"
          />
        ) : (
          <span className="my-2 text-center text-sm">{t('feed.noConferences')}</span>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default ConferencesFeed;
