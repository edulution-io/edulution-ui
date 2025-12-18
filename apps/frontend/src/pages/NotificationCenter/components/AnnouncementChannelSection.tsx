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
import { FormControl, FormFieldSH, FormItem } from '@/components/ui/Form';
import Checkbox from '@/components/ui/Checkbox';
import { UseFormReturn } from 'react-hook-form';
import AnnouncementForm from '@libs/notification-center/types/announcementForm';
import { ChannelsType } from '@libs/notification-center/types/channelsType';
import CHANNELS from '@libs/notification-center/constants/channels';

interface AnnouncementSectionProps {
  form: UseFormReturn<AnnouncementForm>;
}

const AnnouncementChannelSection: React.FC<AnnouncementSectionProps> = ({ form }) => {
  const { t } = useTranslation();
  const { control, watch, setValue, getValues } = form;

  const channels = watch('channels') || [];

  const handleCheckboxChange = (channel: ChannelsType, checked: boolean) => {
    const current = getValues('channels') || [];
    if (checked) {
      setValue('channels', [...current, channel], { shouldValidate: true });
    } else {
      setValue(
        'channels',
        current.filter((c) => c !== channel),
        { shouldValidate: true },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-bold">{t('notificationcenter.channels')}</div>
      <p className="text-sm text-muted-foreground">{t('notificationcenter.channelsDescription')}</p>

      <div className="space-y-3">
        <FormFieldSH
          control={control}
          name="channels"
          render={() => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={channels.includes(CHANNELS.PUSH)}
                  onCheckedChange={(checked) => handleCheckboxChange(CHANNELS.PUSH, !!checked)}
                />
              </FormControl>
              <div>
                <p className="font-medium">{t('notificationcenter.pushNotification')}</p>
                <p className="text-sm text-muted-foreground">{t('notificationcenter.pushDescription')}</p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AnnouncementChannelSection;
