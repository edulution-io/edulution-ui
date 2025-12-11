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
import { Globe, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { PublicShareLinkScopeType } from '@libs/filesharing/types/publicShareLinkScopeType';

interface ShareLinkScopeSelectorProps {
  value: PublicShareLinkScopeType;
  onValueChange: (value: PublicShareLinkScopeType) => void;
}

const optionStyle =
  'flex w-full items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted data-[state=checked]:border-primary';

const ShareLinkScopeSelector: FC<ShareLinkScopeSelectorProps> = ({ value, onValueChange }) => {
  const { t } = useTranslation();

  return (
    <RadioGroupSH
      value={value}
      onValueChange={onValueChange}
      className="flex flex-col gap-3"
    >
      <label
        className={cn(optionStyle)}
        htmlFor="public"
      >
        <div className="flex cursor-pointer items-start gap-3">
          <Globe className="h-8 w-8 text-ciLightBlue" />
          <div>
            <p className="font-semibold">{t('filesharing.publicFileSharing.scope.public')}</p>
            <p className="text-sm text-muted-foreground">{t('filesharing.publicFileSharing.scope.publicHint')}</p>
          </div>
        </div>

        <RadioGroupItemSH
          id="public"
          value="public"
        />
      </label>

      <label
        className={cn(optionStyle)}
        htmlFor="restricted"
      >
        <div className="flex cursor-pointer items-start gap-3">
          <User className="h-8 w-8 text-ciLightYellow" />
          <div>
            <p className="font-semibold">{t('filesharing.publicFileSharing.scope.restricted')}</p>
            <p className="text-sm text-muted-foreground">{t('filesharing.publicFileSharing.scope.restrictedHint')}</p>
          </div>
        </div>

        <RadioGroupItemSH
          id="restricted"
          value="restricted"
        />
      </label>
    </RadioGroupSH>
  );
};

export default ShareLinkScopeSelector;
