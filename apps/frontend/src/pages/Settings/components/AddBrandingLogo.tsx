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

import React, { useEffect, useRef, useState } from 'react';
import { AccordionContent } from '@/components/ui/AccordionSH';
import type { UseFormReturn } from 'react-hook-form';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import type { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import { useTranslation } from 'react-i18next';
import { Theme, ThemeType } from '@libs/common/types/theme';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';
import { GLOBAL_SETTINGS_BRANDING_LOGO } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import BrandingLogoField from '@/pages/Settings/components/BrandingLogoField';

type Props = { form: UseFormReturn<GlobalSettingsFormValues> };

const AddBrandingLogo: React.FC<Props> = ({ form }) => {
  const { t } = useTranslation();
  const { getGlobalAsset } = useFilesystemStore();
  const { deleteGlobalBrandingLogo } = useGlobalSettingsApiStore();

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const [lightLocalSrc, setLightLocalSrc] = useState<string | null>(null);
  const [darkLocalSrc, setDarkLocalSrc] = useState<string | null>(null);

  const [lightServerSrc, setLightServerSrc] = useState<string | null>(null);
  const [darkServerSrc, setDarkServerSrc] = useState<string | null>(null);

  const [lightCacheKey, setLightCacheKey] = useState(0);
  const [darkCacheKey, setDarkCacheKey] = useState(0);

  const [deletingVariant, setDeletingVariant] = useState<ThemeType | null>(null);

  const revokeObjectUrl = (url: string | null, setter: (v: string | null) => void) => {
    if (url) URL.revokeObjectURL(url);
    setter(null);
  };

  const setFormFileForVariant = (variant: ThemeType, file: File | null) => {
    const path: 'brandingUploads.logo.light' | 'brandingUploads.logo.dark' =
      variant === Theme.light ? 'brandingUploads.logo.light' : 'brandingUploads.logo.dark';
    form.setValue(path, file, { shouldDirty: true });
  };

  useEffect(() => {
    let alive = true;

    const loadVariant = async (variant: ThemeType) => {
      try {
        const base = `logo-${variant}`;
        const asset = await getGlobalAsset(GLOBAL_SETTINGS_BRANDING_LOGO, base);
        if (!alive) return;
        if (variant === Theme.light) {
          setLightServerSrc(asset.url);
          setLightCacheKey((v) => v + 1);
        } else {
          setDarkServerSrc(asset.url);
          setDarkCacheKey((v) => v + 1);
        }
      } catch {
        if (!alive) return;
        if (variant === Theme.light) setLightServerSrc(null);
        else setDarkServerSrc(null);
      }
    };

    void Promise.all([loadVariant(Theme.light), loadVariant(Theme.dark)]);

    return () => {
      alive = false;
      revokeObjectUrl(lightLocalSrc, setLightLocalSrc);
      revokeObjectUrl(darkLocalSrc, setDarkLocalSrc);
    };
  }, [getGlobalAsset]);

  const onFileChange =
    (variant: ThemeType): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      const file = e.target.files?.[0] ?? null;

      if (file && !file.type.startsWith('image/')) {
        const ref = variant === Theme.light ? lightInputRef : darkInputRef;
        if (ref.current) ref.current.value = '';
        return;
      }

      if (variant === Theme.light) revokeObjectUrl(lightLocalSrc, setLightLocalSrc);
      else revokeObjectUrl(darkLocalSrc, setDarkLocalSrc);

      setFormFileForVariant(variant, file);

      if (file) {
        const url = URL.createObjectURL(file);
        if (variant === Theme.light) setLightLocalSrc(url);
        else setDarkLocalSrc(url);
      }
    };

  const clearLocalFileSelection = (variant: ThemeType) => {
    setFormFileForVariant(variant, null);
    if (variant === Theme.light) {
      revokeObjectUrl(lightLocalSrc, setLightLocalSrc);
      if (lightInputRef.current) lightInputRef.current.value = '';
    } else {
      revokeObjectUrl(darkLocalSrc, setDarkLocalSrc);
      if (darkInputRef.current) darkInputRef.current.value = '';
    }
  };

  const onDeleteVariant = async (variant: ThemeType) => {
    try {
      setDeletingVariant(variant);
      clearLocalFileSelection(variant);
      await deleteGlobalBrandingLogo(variant);
      if (variant === Theme.light) {
        setLightServerSrc(null);
        setLightCacheKey((v) => v + 1);
      } else {
        setDarkServerSrc(null);
        setDarkCacheKey((v) => v + 1);
      }
    } finally {
      setDeletingVariant(null);
    }
  };

  const lightPreviewSrc = lightLocalSrc ?? lightServerSrc ?? DesktopLogo;
  const darkPreviewSrc = darkLocalSrc ?? darkServerSrc ?? DesktopLogo;

  return (
    <AccordionContent className="space-y-4 px-1">
      <p>{t('settings.globalSettings.brandingLogo.description')}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <BrandingLogoField
          variant={Theme.light}
          lightPreviewSrc={lightPreviewSrc}
          darkPreviewSrc={darkPreviewSrc}
          lightCacheKey={lightCacheKey}
          darkCacheKey={darkCacheKey}
          lightServerSrc={lightServerSrc}
          darkServerSrc={darkServerSrc}
          lightLocalSrc={lightLocalSrc}
          darkLocalSrc={darkLocalSrc}
          deletingVariant={deletingVariant}
          onDeleteVariant={onDeleteVariant}
          onFileChange={onFileChange}
          lightInputRef={lightInputRef}
          darkInputRef={darkInputRef}
        />
      </div>
    </AccordionContent>
  );
};

export default AddBrandingLogo;
