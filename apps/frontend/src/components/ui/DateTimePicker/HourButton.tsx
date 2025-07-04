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

import React, { useCallback } from 'react';
import cn from '@libs/common/utils/className';
import DropdownVariant from '@libs/ui/types/DropdownVariant';
import { Button } from '@/components/shared/Button';

interface HourButtonProps {
  hour: number;
  currentHour: number;
  onChangeHour: (hour: number) => void;
  variant: DropdownVariant;
}
const HourButton = ({ hour, currentHour, onChangeHour, variant }: HourButtonProps) => {
  const handleClick = useCallback(() => {
    onChangeHour(hour);
  }, [hour, onChangeHour]);

  return (
    <Button
      variant={currentHour === hour ? 'btn-outline' : 'btn-small'}
      className={cn(
        'aspect-square max-h-[25px] max-w-[64px] shrink-0 sm:w-full',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'dialog' && 'bg-muted text-secondary',
      )}
      onClick={handleClick}
    >
      {hour}
    </Button>
  );
};

export default HourButton;
