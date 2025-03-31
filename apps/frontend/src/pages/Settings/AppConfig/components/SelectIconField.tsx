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
  const [isSelected, setIsSelected] = useState(ForwardIcon);

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
