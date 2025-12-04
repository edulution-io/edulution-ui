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

import React from 'react';
import { useTranslation } from 'react-i18next';
import APPS from '@libs/appconfig/constants/apps';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AccordionSH } from '@/components/ui/AccordionSH';
import { Card, CardContent } from '@/components/shared/Card';
import FeedAccordionItem from '@/pages/Dashboard/Feed/components/FeedAccordionItem';
import { BulletinBoardIcon, ConferencesIcon, MailIcon, SurveysMenuIcon } from '@/assets/icons';
import useBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinList from '@/pages/Dashboard/Feed/bulletinboard/BulletinList';
import ConferencesList from '@/pages/Dashboard/Feed/conferences/ConferencesList';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import MailList from '@/pages/Dashboard/Feed/mails/MailList';
import SurveysList from '@/pages/Dashboard/Feed/surveys/SurveysList';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';

const Feed = () => {
  const { t } = useTranslation();
  const { bulletinBoardNotifications } = useBulletinBoardStore();
  const { runningConferences } = useConferenceStore();
  const { mails } = useMailsStore();
  const { isSuperAdmin } = useLdapGroups();
  const { openSurveys } = useSurveysTablesPageStore();

  const feed = [
    <FeedAccordionItem
      key={APPS.BULLETIN_BOARD}
      appKey={APPS.BULLETIN_BOARD}
      icon={BulletinBoardIcon}
      listItems={bulletinBoardNotifications}
      ListComponent={BulletinList}
    />,

    <FeedAccordionItem
      key={APPS.CONFERENCES}
      appKey={APPS.CONFERENCES}
      icon={ConferencesIcon}
      listItems={runningConferences}
      ListComponent={ConferencesList}
    />,

    <FeedAccordionItem
      key={APPS.MAIL}
      appKey={APPS.MAIL}
      icon={MailIcon}
      listItems={mails}
      ListComponent={MailList}
      isVisible={!isSuperAdmin}
    />,

    <FeedAccordionItem
      key={APPS.SURVEYS}
      appKey={APPS.SURVEYS}
      icon={SurveysMenuIcon}
      listItems={openSurveys}
      ListComponent={SurveysList}
    />,
  ];

  return (
    <Card
      variant="collaboration"
      className="min-h-[280px] overflow-y-auto scrollbar-thin md:min-h-[100%]"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <h3 className="mb-6 font-bold">{t('feed.title')}</h3>
        <div className="flex flex-col gap-3 p-0">
          <ScrollArea className="scrollbar-thin">
            <AccordionSH
              type="multiple"
              defaultValue={[APPS.CONFERENCES, APPS.SURVEYS, APPS.BULLETIN_BOARD]}
            >
              {...feed}
            </AccordionSH>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
