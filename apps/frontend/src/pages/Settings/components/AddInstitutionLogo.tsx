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

import React, { useRef, useState } from 'react';
import { AccordionContent } from '@/components/ui/AccordionSH';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import getCompressedImage from '@/utils/getCompressedImage';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';

interface InstitutionLogoProps {
  form: UseFormReturn<GlobalSettingsDto>;
}

const AddInstitutionLogo: React.FC<InstitutionLogoProps> = ({ form }) => {
  const { t } = useTranslation();

  const [lightPreview, setLightPreview] = useState<string | null>(null);
  const [darkPreview, setDarkPreview] = useState<string | null>(null);

  const lightInputRef = useRef<HTMLInputElement>(null);
  const darkInputRef = useRef<HTMLInputElement>(null);

  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'light' | 'dark') => {
    const file = e.target.files?.[0];
    if (!file) {
      form.setValue(`general.institutionLogo.${kind}`, '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (kind === 'light') setLightPreview(null);
      else setDarkPreview(null);
      return;
    }

    try {
      const compressedBase64 = await getCompressedImage(file, 100);
      form.setValue(`general.institutionLogo.${kind}`, compressedBase64, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (kind === 'light') setLightPreview(compressedBase64);
      else setDarkPreview(compressedBase64);
    } catch (error) {
      toast.error(t(error instanceof Error ? error.message : 'usersettings.errors.notAbleToCompress'));
      const dataUrl = await fileToDataURL(file);
      form.setValue(`general.institutionLogo.${kind}`, dataUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (kind === 'light') setLightPreview(dataUrl);
      else setDarkPreview(dataUrl);
    }
  };

  const clearLogo = (kind: 'light' | 'dark') => {
    form.setValue(`general.institutionLogo.${kind}`, '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (kind === 'light') {
      setLightPreview(null);
      if (lightInputRef.current) lightInputRef.current.value = '';
    } else {
      setDarkPreview(null);
      if (darkInputRef.current) darkInputRef.current.value = '';
    }
  };

  return (
    <AccordionContent className="px-1">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400">
          {lightPreview ? (
            <>
              <img
                src={lightPreview}
                alt="Light Logo Preview"
                className="h-20 w-auto object-contain"
              />
              <Button
                type="button"
                variant="btn-small"
                onClick={() => clearLogo('light')}
              >
                <X className="h-4 w-4" />
                {t('common.delete')}
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 " />
              <p className="mt-2 text-sm font-medium text-background">
                {t('settings.globalSettings.institutionLogo.uploadLightLogo')}
              </p>
            </>
          )}

          <input
            ref={lightInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoChange(e, 'light')}
            className="mt-3 block w-full cursor-pointer text-sm  file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400">
          {darkPreview ? (
            <>
              <img
                src={darkPreview}
                alt="Dark Logo Preview"
                className="h-20 w-auto object-contain"
              />
              <Button
                type="button"
                variant="btn-small"
                onClick={() => clearLogo('dark')}
              >
                <X className="h-4 w-4" />
                {t('common.remove') || 'Entfernen'}
              </Button>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-700">
                {t('settings.globalSettings.institutionLogo.uploadDarkLogo') || 'Dark Logo hochladen'}
              </p>
            </>
          )}

          <input
            ref={darkInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoChange(e, 'dark')}
            className="mt-3 block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>
      </div>
    </AccordionContent>
  );
};

export default AddInstitutionLogo;
