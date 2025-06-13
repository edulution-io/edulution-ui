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
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface PasswordInputProps {
  placeholder: string;
}

const PublicFilePasswordInput: React.FC<PasswordInputProps> = ({ placeholder }) => {
  const {
    register,
    formState: { errors },
    clearErrors,
  } = useFormContext<{ password: string }>();

  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 pt-4">
        <p>{t('filesharing.publicFileSharing.getFileAccess')}</p>
        <input
          {...register('password', {
            onChange: () => errors.password && clearErrors('password'),
          })}
          type="password"
          placeholder={placeholder}
          className="w-full rounded-md bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
        />
      </div>
      {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
    </div>
  );
};

export default PublicFilePasswordInput;
