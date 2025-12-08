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

import React, { useEffect, useState } from 'react';
import {
  AiChatIcon,
  AntiMalwareIcon,
  BackupIcon,
  BulletinBoardIcon,
  ChatIcon,
  ClassManagementIcon,
  ConferencesIcon,
  DesktopDeploymentIcon,
  EmbeddedIcon,
  FileSharingIcon,
  FirewallIcon,
  ForumsIcon,
  ForwardIcon,
  KnowledgeBaseIcon,
  LearningManagementIcon,
  LinuxmusterIcon,
  LocationServicesIcon,
  MailIcon,
  MobileDevicesIcon,
  NativeIcon,
  NetworkIcon,
  PrinterIcon,
  RoomBookingIcon,
  SchoolInformationIcon,
  SurveysMenuIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WhiteBoardIcon,
  WlanIcon,
} from '@/assets/icons';
import { Card } from '@/components/shared/Card';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import { UseFormReturn } from 'react-hook-form';

const iconsList = [
  AiChatIcon,
  AntiMalwareIcon,
  BackupIcon,
  BulletinBoardIcon,
  ChatIcon,
  ClassManagementIcon,
  ConferencesIcon,
  DesktopDeploymentIcon,
  EmbeddedIcon,
  FileSharingIcon,
  FirewallIcon,
  ForumsIcon,
  ForwardIcon,
  KnowledgeBaseIcon,
  LearningManagementIcon,
  LinuxmusterIcon,
  LocationServicesIcon,
  MailIcon,
  MobileDevicesIcon,
  NativeIcon,
  NetworkIcon,
  PrinterIcon,
  RoomBookingIcon,
  SchoolInformationIcon,
  SurveysMenuIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WhiteBoardIcon,
  WlanIcon,
];

const SelectIconField = ({ form }: { form: UseFormReturn<{ customAppName: string; customIcon: string }> }) => {
  const { t } = useTranslation();
  const [isSelected, setIsSelected] = useState('');

  useEffect(() => {
    if (isSelected) {
      form.setValue('customIcon', isSelected);
    }
  }, [form, isSelected]);

  return (
    <div>
      <p className="mb-1 font-bold">{t('appstore.chooseIcon')}</p>
      <Card
        className="flex flex-wrap gap-4 bg-muted p-3"
        variant="text"
      >
        {iconsList.map((icon) => {
          const iconName = icon.split('/').at(-1);
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => setIsSelected(icon)}
              className={cn(
                'rounded-xl border-2 transition-colors hover:border-secondary',
                isSelected === icon ? 'border-primary' : 'border-transparent',
              )}
            >
              <img
                src={icon}
                alt={iconName}
                className="h-14 w-14"
              />
            </button>
          );
        })}
      </Card>
    </div>
  );
};

export default SelectIconField;
