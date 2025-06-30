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

import React, { FC } from 'react';
import { Globe, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { PublicShareLinkScopeType } from '@libs/filesharing/types/publicShareLinkScopeType';

interface ShareScopeSelectorProps {
  value: PublicShareLinkScopeType;
  onValueChange: (value: PublicShareLinkScopeType) => void;
}

const optionStyle =
  'flex w-full items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted data-[state=checked]:border-primary';

const ShareScopeSelector: FC<ShareScopeSelectorProps> = ({ value, onValueChange }) => {
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
        <div className="flex items-start gap-3">
          <Globe className="h-8 w-8 text-green-600" />
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
        <div className="flex items-start gap-3">
          <User className="h-8 w-8 text-amber-600" />
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

export default ShareScopeSelector;
