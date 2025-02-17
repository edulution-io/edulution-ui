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
import APPS from '@libs/appconfig/constants/apps';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AccordionSH } from '@/components/ui/AccordionSH';
import { Card, CardContent } from '@/components/shared/Card';
import ConferencesFeed from '@/pages/Dashboard/Feed/conferences/ConferencesFeed';
import MailsFeed from '@/pages/Dashboard/Feed/mails/MailsFeed';
import SurveysFeed from '@/pages/Dashboard/Feed/surveys/SurveysFeed';

const Feed = () => {
  const { t } = useTranslation();

  return (
    <Card
      variant="collaboration"
      className="min-h-[280px] overflow-y-auto scrollbar-thin md:min-h-[100%]"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <h4 className="mb-6 font-bold">{t('feed.title')}</h4>
        <div className="flex flex-col gap-3 p-0">
          <ScrollArea className="scrollbar-thin">
            <AccordionSH
              type="multiple"
              defaultValue={[APPS.MAIL, APPS.CONFERENCES, APPS.SURVEYS]}
            >
              <ConferencesFeed />
              <MailsFeed />
              <SurveysFeed />
            </AccordionSH>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
