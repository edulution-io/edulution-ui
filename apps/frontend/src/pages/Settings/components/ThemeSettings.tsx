/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
