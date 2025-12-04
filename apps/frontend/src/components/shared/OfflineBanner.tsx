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
import { CiWifiOff } from 'react-icons/ci';
import useMedia from '@/hooks/useMedia';
import cn from '@libs/common/utils/className';

const OfflineBanner = () => {
  const { t } = useTranslation();
  const { isMobileView } = useMedia();

  return (
    <div
      className={cn(
        'absolute left-1/2 top-[5px] z-[500] inline-flex -translate-x-1/2 transform items-center space-x-1 rounded-3xl',
        'bg-secondary-foreground px-2 py-1 text-muted-foreground shadow-xl',
        { 'left-[calc(50%-var(--sidebar-width)/2)]': !isMobileView },
      )}
    >
      <span>{t('common.offline')}</span> <CiWifiOff size={18} />
    </div>
  );
};

export default OfflineBanner;
