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

import React, { isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NativeAppHeaderProps from '@libs/ui/types/NativeAppHeaderProps';
import getAppIconClassName from '@/utils/getAppIconClassName';
import { cn , Button } from '@edulution-io/ui-kit';
import { EditIcon } from '@libs/common/constants/standardActionIcons';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import IconWrapper from '@/components/shared/IconWrapper';

const NativeAppHeader = ({ title, iconSrc, description, isAppIconEditable = false }: NativeAppHeaderProps) => {
  const { t } = useTranslation();
  const setIsEditIconDialogOpen = useAppConfigsStore((state) => state.setIsEditIconDialogOpen);

  const renderIcon = () => {
    if (isValidElement(iconSrc)) {
      return iconSrc;
    }

    if (typeof iconSrc === 'string') {
      return (
        <IconWrapper
          iconSrc={iconSrc}
          alt={`${title} ${t('common.icon')}`}
          className="h-20 w-20 object-contain"
          width={80}
          height={80}
        />
      );
    }

    const iconClassName = getAppIconClassName(iconSrc);
    const baseClassName = cn('h-20 w-20 object-contain text-foreground dark:text-white', iconClassName);
    return (
      <FontAwesomeIcon
        icon={iconSrc}
        className={cn(baseClassName, 'scale-75')}
      />
    );
  };

  return (
    <div className="mr-2 flex min-h-[6.25rem] pl-2 md:pl-4 xl:max-h-[6.25rem]">
      <div className="group relative hidden md:block">
        {renderIcon()}

        {isAppIconEditable && (
          <Button
            variant="btn-small"
            onClick={() => setIsEditIconDialogOpen(true)}
            className="absolute -right-1 top-1 h-8 w-8 rounded-full bg-gray-700 bg-opacity-70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-500 hover:bg-opacity-90"
          >
            <FontAwesomeIcon
              icon={EditIcon}
              className="h-4 w-4"
            />
          </Button>
        )}
      </div>

      <div className="ml-4">
        <h1>{title}</h1>
        <div className="pt-5 sm:pt-0">{description && <p className="pb-4">{description}</p>}</div>
      </div>
    </div>
  );
};

export default NativeAppHeader;
