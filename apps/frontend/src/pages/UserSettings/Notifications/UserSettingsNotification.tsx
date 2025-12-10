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
import { MailIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import { useTranslation } from 'react-i18next';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import EnableNotificationSettings from '@/pages/UserSettings/Notifications/components/EnableNotificationSettings';
import ModuleNotificationPreferences from '@/pages/UserSettings/Notifications/components/ModuleNotificationPreferences';

const UserSettingsNotification: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('usersettings.notifications.title'),
        description: t('usersettings.notifications.description'),
        iconSrc: MailIcon,
      }}
    >
      <SectionAccordion defaultOpenAll>
        <SectionAccordionItem
          id="push"
          label={t('usersettings.notifications.push')}
        >
          <EnableNotificationSettings />
        </SectionAccordionItem>
        <SectionAccordionItem
          id="modules"
          label={t('usersettings.notifications.modules.title')}
        >
          <ModuleNotificationPreferences />
        </SectionAccordionItem>
      </SectionAccordion>
    </PageLayout>
  );
};

export default UserSettingsNotification;
