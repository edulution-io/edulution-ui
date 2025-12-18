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
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type AttendeeDto from '@libs/user/types/attendee.dto';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useGroupStore from '@/store/GroupStore';
import useUserStore from '@/store/UserStore/useUserStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { UseFormReturn } from 'react-hook-form';
import AnnouncementForm from '@libs/notification-center/types/announcementForm';

interface AnnouncementSectionProps {
  form: UseFormReturn<AnnouncementForm>;
}

const AnnouncementRecipientsSection: React.FC<AnnouncementSectionProps> = ({ form }) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { searchAttendees } = useUserStore();
  const { control, setValue, getValues } = form;

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const uniqueGroups = newGroups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue('recipientGroups', uniqueGroups, { shouldValidate: true });
  };

  const handleUsersChange = (newUsers: AttendeeDto[]) => {
    const uniqueUsers = newUsers.reduce<AttendeeDto[]>((acc, u) => {
      if (!acc.some((x) => x.value === u.value)) acc.push(u);
      return acc;
    }, []);
    setValue('recipientUsers', uniqueUsers, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="font-bold">{t('notificationcenter.recipients')}</div>
      <p className="text-sm text-muted-foreground">{t('notificationcenter.recipientsDescription')}</p>

      <FormFieldSH
        control={control}
        name="recipientGroups"
        render={() => (
          <FormItem>
            <p className="font-bold">{t('permission.groups')}</p>
            <FormControl>
              <AsyncMultiSelect<MultipleSelectorGroup>
                value={getValues('recipientGroups') ?? []}
                onSearch={searchGroups}
                onChange={handleGroupsChange}
                placeholder={t('search.type-to-search')}
                variant="dialog"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormFieldSH
        control={control}
        name="recipientUsers"
        render={() => (
          <FormItem>
            <p className="font-bold">{t('notificationcenter.users')}</p>
            <FormControl>
              <AsyncMultiSelect<AttendeeDto>
                value={getValues('recipientUsers') ?? []}
                onSearch={searchAttendees}
                onChange={handleUsersChange}
                placeholder={t('search.type-to-search')}
                variant="dialog"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AnnouncementRecipientsSection;
