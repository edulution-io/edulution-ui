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
import { Button } from '@/components/shared/Button';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/types/theme';
import FileSelectButton from '@/components/ui/FileSelectButton';

interface BrandingLogoFieldProps {
  variant: ThemeType;
  lightPreviewSrc: string;
  darkPreviewSrc: string;
  lightCacheKey: number;
  darkCacheKey: number;
  lightServerSrc: string | null;
  darkServerSrc: string | null;
  lightLocalSrc: string | null;
  darkLocalSrc: string | null;
  deletingVariant: ThemeType | null;
  lightInputRef: React.RefObject<HTMLInputElement>;
  darkInputRef: React.RefObject<HTMLInputElement>;
  onDeleteVariant: (variant: ThemeType) => void;
  onFileChange: (variant: ThemeType) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BrandingLogoField: React.FC<BrandingLogoFieldProps> = ({
  variant,
  lightPreviewSrc,
  darkPreviewSrc,
  lightCacheKey,
  darkCacheKey,
  lightServerSrc,
  darkServerSrc,
  lightLocalSrc,
  darkLocalSrc,
  deletingVariant,
  onDeleteVariant,
  onFileChange,
  lightInputRef,
  darkInputRef,
}) => {
  const isLightVariant = variant === Theme.light;
  const previewSrc = isLightVariant ? lightPreviewSrc : darkPreviewSrc;
  const cacheKey = isLightVariant ? lightCacheKey : darkCacheKey;
  const fileInputRef = isLightVariant ? lightInputRef : darkInputRef;

  const hasServerAsset = Boolean(isLightVariant ? lightServerSrc : darkServerSrc);
  const hasLocalSelection = Boolean(isLightVariant ? lightLocalSrc : darkLocalSrc);

  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400 ${isLightVariant ? 'bg-white' : 'bg-neutral-900'}`}
    >
      <img
        key={cacheKey}
        src={previewSrc || DesktopLogo}
        alt={isLightVariant ? 'Light Logo' : 'Dark Logo'}
        className="h-20 w-auto object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DesktopLogo;
        }}
      />
      <div className="mt-3 grid w-full grid-cols-1 gap-2">
        <FileSelectButton
          ref={fileInputRef}
          accept="image/*"
          onChange={onFileChange(variant)}
          hasSelection={hasLocalSelection}
          chooseText={t('common.chooseFile') ?? 'Datei auswählen'}
          changeText={t('common.changeFile') ?? 'Datei ändern'}
          labelClassName="w-full"
        />

        {!hasLocalSelection && hasServerAsset && (
          <Button
            type="button"
            variant="btn-small"
            className="w-full bg-red-500"
            onClick={() => onDeleteVariant(variant)}
            disabled={deletingVariant === variant}
          >
            <Trash2 className="h-4 w-4" />
            {t('common.delete')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BrandingLogoField;
