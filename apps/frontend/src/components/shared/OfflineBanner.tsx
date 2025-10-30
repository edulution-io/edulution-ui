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
