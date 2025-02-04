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
import { MailIcon } from '@/assets/icons';
import APPS from '@libs/appconfig/constants/apps';
import MailList from '@/pages/Dashboard/Feed/mails/MailList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';
import useLdapGroups from '@/hooks/useLdapGroups';

const MailsFeed = () => {
  const { mails } = useMailsStore();
  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const isActive = useIsMailsActive();
  if (!isActive || isSuperAdmin) {
    return null;
  }

  return (
    <AccordionItem value={APPS.MAIL}>
      <FeedWidgetAccordionTrigger
        src={MailIcon}
        alt={`${APPS.MAIL}-notification-icon`}
        labelTranslationId="mail.sidebar"
      />
      <AccordionContent className="pb-2">
        {mails.length > 0 ? (
          <MailList
            items={mails}
            className="my-2"
          />
        ) : (
          <span className="my-2 text-center text-sm">{t('feed.noMails')}</span>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MailsFeed;
