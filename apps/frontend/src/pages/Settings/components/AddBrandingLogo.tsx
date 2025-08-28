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
  const lightRef = useRef<HTMLInputElement>(null);
  const darkRef = useRef<HTMLInputElement>(null);
  const [localLight, setLocalLight] = useState<string | null>(null);
  const [localDark, setLocalDark] = useState<string | null>(null);
  const [fetchedLight, setFetchedLight] = useState<string | null>(null);
  const [fetchedDark, setFetchedDark] = useState<string | null>(null);
  const [cbLight, setCbLight] = useState(0);
  const [cbDark, setCbDark] = useState(0);

  const [isDeleting, setIsDeleting] = useState<ThemeType | null>(null);

  const revoke = (url: string | null, setter: (v: string | null) => void) => {
    if (url) URL.revokeObjectURL(url);
    setter(null);
  };

  const setFormFile = (theme: ThemeType, file: File | null) => {
    const key = `brandingUploads.logo.${theme}`;
    form.setValue(key, file, { shouldDirty: true });
  };

  useEffect(() => {
    let alive = true;

    const load = async (theme: ThemeType) => {
      try {
        const base = `logo-${theme}`;
        const asset = await getGlobalAsset(GLOBAL_SETTINGS_BRANDING_LOGO, base);
        if (!alive) return;
        if (theme === Theme.light) {
          setFetchedLight(asset.url);
        } else {
          setFetchedDark(asset.url);
        }
      } catch {
        if (!alive) return;
        if (theme === Theme.light) {
          setFetchedLight(null);
        } else {
          setFetchedDark(null);
        }
      }
    };

    void Promise.all([load(Theme.light), load(Theme.dark)]);

    return () => {
      alive = false;
      revoke(localLight, setLocalLight);
      revoke(localDark, setLocalDark);
    };
  }, [getGlobalAsset]);

  const handleFileChange =
    (theme: ThemeType): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      const file = e.target.files?.[0] ?? null;

      if (file && !file.type.startsWith('image/')) {
        const ref = theme === Theme.light ? lightRef : darkRef;
        if (ref.current) ref.current.value = '';
        return;
      }
      if (theme === Theme.light) revoke(localLight, setLocalLight);
      else revoke(localDark, setLocalDark);
      setFormFile(theme, file);
      if (file) {
        const url = URL.createObjectURL(file);
        if (theme === Theme.light) {
          setLocalLight(url);
        } else {
          setLocalDark(url);
        }
      }
    };

  const clearLocalSelection = (theme: ThemeType) => {
    setFormFile(theme, null);
    if (theme === Theme.light) {
      revoke(localLight, setLocalLight);
      if (lightRef.current) lightRef.current.value = '';
    } else {
      revoke(localDark, setLocalDark);
      if (darkRef.current) darkRef.current.value = '';
    }
  };

  const deleteServer = async (theme: ThemeType) => {
    try {
      setIsDeleting(theme);
      clearLocalSelection(theme);
      await deleteGlobalBrandingLogo(theme);
      if (theme === Theme.light) {
        setFetchedLight(null);
        setCbLight((v) => v + 1);
      } else {
        setFetchedDark(null);
        setCbDark((v) => v + 1);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const srcLight = localLight ?? (fetchedLight ? `${fetchedLight}` : DesktopLogo);
  const srcDark = localDark ?? (fetchedDark ? `${fetchedDark}` : DesktopLogo);

  return (
    <AccordionContent className="space-y-4 px-1">
      <p>{t('settings.globalSettings.brandingLogo.description')}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <BrandingLogoField
          theme="light"
          srcLight={srcLight}
          srcDark={srcDark}
          cbLight={cbLight}
          cbDark={cbDark}
          fetchedLight={fetchedLight}
          fetchedDark={fetchedDark}
          localLight={localLight}
          localDark={localDark}
          isDeleting={isDeleting}
          deleteServer={deleteServer}
          handleFileChange={handleFileChange}
          lightRef={lightRef}
          darkRef={darkRef}
        />
      </div>
    </AccordionContent>
  );
};

export default AddBrandingLogo;
