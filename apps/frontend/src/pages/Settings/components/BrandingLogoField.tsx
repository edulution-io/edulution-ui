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

import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/shared/Button';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/types/theme';

interface BrandingLogoFieldProps {
  theme: ThemeType;
  srcLight: string;
  srcDark: string;
  cbLight: number;
  cbDark: number;
  fetchedLight: string | null;
  fetchedDark: string | null;
  localLight: string | null;
  localDark: string | null;
  isDeleting: ThemeType | null;
  lightRef: React.RefObject<HTMLInputElement>;
  darkRef: React.RefObject<HTMLInputElement>;
  deleteServer: (theme: ThemeType) => void;
  handleFileChange: (theme: ThemeType) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrandingLogoField: React.FC<BrandingLogoFieldProps> = ({
  theme,
  srcLight,
  srcDark,
  cbLight,
  cbDark,
  fetchedLight,
  fetchedDark,
  localLight,
  localDark,
  isDeleting,
  deleteServer,
  handleFileChange,
  lightRef,
  darkRef,
}) => {
  const isLight = theme === Theme.light;
  const src = isLight ? srcLight : srcDark;
  const inputRef = isLight ? lightRef : darkRef;
  const hasFetched = isLight ? fetchedLight : fetchedDark;
  const hasLocal = isLight ? localLight : localDark;

  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400 ${isLight ? 'bg-white' : 'bg-neutral-900'}`}
    >
      <div className={`mb-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-100'}`}>
        {isLight ? (t('common.light') ?? 'Light') : (t('common.dark') ?? 'Dark')}
      </div>

      <img
        key={isLight ? cbLight : cbDark}
        src={src}
        alt={isLight ? 'Light Logo' : 'Dark Logo'}
        className="h-20 w-auto object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DesktopLogo;
        }}
      />

      <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange(theme)}
          className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        <div className="flex w-full justify-center gap-2 sm:justify-end">
          {!hasLocal && hasFetched && (
            <Button
              type="button"
              variant="btn-attention"
              onClick={() => deleteServer(theme)}
              disabled={isDeleting === theme}
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandingLogoField;
