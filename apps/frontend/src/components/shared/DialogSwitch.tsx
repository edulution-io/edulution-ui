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

import Switch from '@/components/ui/Switch';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

const DialogSwitch = ({
  checked,
  onCheckedChange,
  translationId,
}: {
  checked: boolean;
  translationId: string;
  onCheckedChange: (isChecked: boolean) => void;
}) => {
  const { t } = useTranslation();

  const switchId = useId();

  return (
    <div className="flex justify-between">
      <div>{t(translationId)}</div>
      <div>
        <label
          htmlFor={switchId}
          className="mr-2 cursor-pointer"
        >
          {t(`common.${checked ? 'yes' : 'no'}`)}
        </label>
        <Switch
          id={switchId}
          checked={checked}
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

export default DialogSwitch;
