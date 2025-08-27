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
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import type { UseFormReturn } from 'react-hook-form';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import { Input } from '@/components/ui/Input';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import { useTranslation } from 'react-i18next';

type Props = { form: UseFormReturn<GlobalSettingsFormValues> };

const AddInstitutionLogo: React.FC<Props> = ({ form }) => {
  const inputReference = useRef<HTMLInputElement>(null);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [hasServerLogo, setHasServerLogo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);
  const { deleteGlobalBranding, globalBranding, getGlobalBranding } = useGlobalSettingsApiStore();
  const { t } = useTranslation();

  useEffect(() => {
    void getGlobalBranding();
  }, []);

  const serverLogoUrlBase = globalBranding?.logo?.url || '';
  const imageSource = localObjectUrl || (serverLogoUrlBase ? `${serverLogoUrlBase}?v=${cacheBuster}` : DesktopLogo);

  useEffect(() => {
    if (!serverLogoUrlBase) return;
    setCacheBuster((v) => v + 1);
  }, [serverLogoUrlBase]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      if (inputReference.current) inputReference.current.value = '';
      return;
    }
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }
    form.setValue('brandingUploadFile', file, { shouldDirty: true });
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLocalObjectUrl(objectUrl);
      setHasServerLogo(false);
    }
  };

  const clearLocalSelection = () => {
    form.setValue('brandingUploadFile', null, { shouldDirty: true });
    if (localObjectUrl) {
      URL.revokeObjectURL(localObjectUrl);
      setLocalObjectUrl(null);
    }
    if (inputReference.current) inputReference.current.value = '';
  };

  const deleteServerLogo = async () => {
    try {
      setIsDeleting(true);
      if (inputReference.current) inputReference.current.value = '';
      clearLocalSelection();
      await deleteGlobalBranding();
      setHasServerLogo(false);
      setCacheBuster((v) => v + 1);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AccordionContent className="space-y-2 px-1">
      <p>{t('settings.globalSettings.brandingLogo.description')}</p>
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400">
        <img
          key={cacheBuster}
          src={imageSource}
          alt="Logo"
          className="h-20 w-auto object-contain"
          onLoad={(e) => {
            const src = e.currentTarget.getAttribute('src') || '';
            if (!localObjectUrl && serverLogoUrlBase && src.startsWith(serverLogoUrlBase)) {
              setHasServerLogo(true);
            }
          }}
          onError={(e) => {
            setHasServerLogo(false);
            (e.currentTarget as HTMLImageElement).src = DesktopLogo;
          }}
        />
        <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            ref={inputReference}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full cursor-pointer text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <div className="flex w-full justify-center gap-2 sm:justify-end">
            {!localObjectUrl && hasServerLogo && (
              <Button
                type="button"
                variant="btn-attention"
                onClick={deleteServerLogo}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AccordionContent>
  );
};

export default AddInstitutionLogo;
