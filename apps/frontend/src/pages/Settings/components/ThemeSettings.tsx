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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { AccordionContent } from '@/components/ui/AccordionSH';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import ThemeColors from '@libs/global-settings/types/themeColors';
import ThemeColorPicker from '@/pages/Settings/GlobalSettings/components/ThemeColorPicker';
import type { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import { Button } from '@/components/shared/Button';
import applyThemeColors from '@/utils/applyThemeColors';
import getThemeWithDefaults from '@/utils/getThemeWithDefaults';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';

type ThemeSettingsProps = {
  form: UseFormReturn<GlobalSettingsFormValues>;
};

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ form }) => {
  const { t } = useTranslation();
  const { publicTheme } = useGlobalSettingsApiStore();
  const { watch, setValue, getValues } = form;

  const themeColors = watch('theme.dark');
  const [previewTheme, setPreviewTheme] = useState<ThemeColors | null>(null);

  useEffect(() => {
    if (!previewTheme) {
      return undefined;
    }

    const root = document.documentElement;
    applyThemeColors(previewTheme, root);

    return () => {
      const actualTheme = getThemeWithDefaults(publicTheme);
      applyThemeColors(actualTheme, root);
    };
  }, [previewTheme, publicTheme]);

  const handleThemeColorChange = (colorType: keyof ThemeColors, value: string) => {
    const newTheme = {
      ...getValues('theme.dark'),
      [colorType]: value,
    };
    setValue(`theme.dark.${colorType}`, value, { shouldDirty: true });
    setPreviewTheme(newTheme);
  };

  const handleResetTheme = () => {
    setValue('theme', defaultValues.theme, { shouldDirty: true });
    setPreviewTheme(defaultValues.theme.dark);
  };

  const colorFields: Array<{ key: keyof ThemeColors; labelKey: string; descriptionKey: string }> = [
    { key: 'primary', labelKey: 'primaryColor', descriptionKey: 'primaryDescription' },
    { key: 'secondary', labelKey: 'secondaryColor', descriptionKey: 'secondaryDescription' },
    { key: 'ciLightGreen', labelKey: 'ciLightGreen', descriptionKey: 'ciLightGreenDescription' },
    { key: 'ciLightBlue', labelKey: 'ciLightBlue', descriptionKey: 'ciLightBlueDescription' },
  ];

  return (
    <AccordionContent className="space-y-4 px-1">
      {colorFields.map(({ key, labelKey, descriptionKey }) => (
        <ThemeColorPicker
          key={key}
          label={t(`settings.globalSettings.theme.${labelKey}`)}
          value={themeColors?.[key] || defaultValues.theme.dark[key]}
          onChange={(value) => handleThemeColorChange(key, value)}
          description={t(`settings.globalSettings.theme.${descriptionKey}`)}
        />
      ))}

      <Button
        type="button"
        variant="btn-collaboration"
        size="md"
        onClick={handleResetTheme}
      >
        {t('settings.globalSettings.theme.resetToDefaults')}
      </Button>
    </AccordionContent>
  );
};

export default ThemeSettings;
