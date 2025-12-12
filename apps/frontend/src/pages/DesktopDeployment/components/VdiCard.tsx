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
import { MdRefresh } from 'react-icons/md';

interface VdiCardProps {
  title: string;
  availableCount: number;
  osType: VirtualMachineOs;
  onSelect: () => void;
  onReload: () => void;
}

const VdiCard: FC<VdiCardProps> = ({ title, availableCount, osType, onSelect, onReload }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="relative w-72 p-4 shadow"
      aria-label={title}
      variant="text"
    >
      <button
        type="button"
        onClick={onReload}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-accent-light hover:text-background"
        aria-label={t('common.reload')}
      >
        <MdRefresh className="h-5 w-5" />
      </button>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 flex items-center justify-center">
          <img
            src={osType === VirtualMachineOs.UBUNTU ? LinuxLogo : WindowsLogo}
            alt="os_logo"
            className="h-12 w-12"
          />
        </div>
        <div className="col-span-2">
          <h3>{title}</h3>
          <p className="text-sm text-muted-foreground">
            {availableCount} {t('desktopdeployment.clients')}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="sm"
          onClick={onSelect}
          disabled={availableCount === 0}
        >
          {t('common.start')}
        </Button>
      </div>
    </Card>
  );
};

export default VdiCard;
