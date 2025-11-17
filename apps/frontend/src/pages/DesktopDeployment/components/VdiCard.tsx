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

import React, { FC } from 'react';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { LinuxLogo, WindowsLogo } from '@/assets/icons';
import { Card } from '@/components/shared/Card';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';

interface CardProps {
  title: string;
  availableClients: number;
  onClick: () => void;
  osType: VirtualMachineOs;
  disabled?: boolean;
}

const VdiCard: FC<CardProps> = ({ title, availableClients = 0, onClick, osType, disabled = false }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="grid w-72 grid-cols-3 gap-4 border border-gray-200 p-4 shadow"
      aria-label={title}
    >
      <div className="col-span-1 flex items-center justify-center">
        <img
          src={osType === VirtualMachineOs.UBUNTU ? LinuxLogo : WindowsLogo}
          alt="os_logo"
          className="h-12 w-12"
        />
      </div>
      <div className="col-span-2">
        <h3>{title}</h3>
        <p>{`${availableClients} ${t('desktopdeployment.clients')}`}</p>
      </div>
      <div className="col-span-3 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="sm"
          onClick={onClick}
          disabled={disabled}
        >
          {t('common.start')}
        </Button>
      </div>
    </Card>
  );
};

export default VdiCard;
