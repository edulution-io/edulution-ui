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

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteIcon } from '@libs/common/constants/standardActionIcons';
import { Card } from '@/components/shared/Card';
import { Button, cn } from '@edulution-io/ui-kit';
import DropZone from '@/components/ui/DropZone';
import { loadFontAwesomeIcon } from '@/utils/fontAwesomeIcons';
import IconWrapper from '@/components/shared/IconWrapper';
import {
  CUSTOM_UPLOAD_IDENTIFIER,
  FONT_AWESOME_IDENTIFIER,
  FONT_AWESOME_BRANDS_IDENTIFIER,
  ICON_CATEGORY_SOLID,
  ICON_CATEGORY_BRANDS,
} from '@libs/ui/constants/icon';
import defaultIconList from './defaultIconList';
import FontAwesomeIconGrid from './FontAwesomeIconGrid';

interface AppConfigIconEditorProps {
  currentIcon: string;
  onIconChange: (icon: string) => void;
}

const AppConfigIconEditor: React.FC<AppConfigIconEditorProps> = ({ currentIcon, onIconChange }) => {
  const { t } = useTranslation();
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);
  const [displayIconUrl, setDisplayIconUrl] = useState<string>(currentIcon);

  useEffect(() => {
    setSelectedIcon(currentIcon);
    const loadIcon = async () => {
      if (currentIcon && currentIcon.includes(FONT_AWESOME_IDENTIFIER)) {
        try {
          const category = currentIcon.includes(FONT_AWESOME_BRANDS_IDENTIFIER)
            ? ICON_CATEGORY_BRANDS
            : ICON_CATEGORY_SOLID;
          const name = currentIcon.split('/').pop()?.replace('.svg', '') || '';
          const url = await loadFontAwesomeIcon({ name, category, path: currentIcon });
          setDisplayIconUrl(url);
        } catch {
          setDisplayIconUrl(currentIcon);
        }
      } else {
        setDisplayIconUrl(currentIcon);
      }
    };
    void loadIcon();
  }, [currentIcon]);

  const handleSelectDefaultIcon = (icon: string) => {
    setSelectedIcon(icon);
    setDisplayIconUrl(icon);
    onIconChange(icon);
  };

  const handleSelectFontAwesomeIcon = async (iconPath: string) => {
    setSelectedIcon(iconPath);
    try {
      const category = iconPath.includes(FONT_AWESOME_BRANDS_IDENTIFIER) ? ICON_CATEGORY_BRANDS : ICON_CATEGORY_SOLID;
      const name = iconPath.split('/').pop()?.replace('.svg', '') || '';
      const url = await loadFontAwesomeIcon({ name, category, path: iconPath });
      setDisplayIconUrl(url);
      onIconChange(iconPath);
    } catch (error) {
      console.error('Failed to load FontAwesome icon', error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          let dataUrl = reader.result as string;
          if (dataUrl.startsWith('data:image/svg+xml;')) {
            dataUrl = dataUrl.replace('data:image/svg+xml;', `data:image/svg+xml;${CUSTOM_UPLOAD_IDENTIFIER};`);
          }
          setSelectedIcon(dataUrl);
          setDisplayIconUrl(dataUrl);
          onIconChange(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [onIconChange],
  );

  const handleDeleteIcon = () => {
    setSelectedIcon('');
    setDisplayIconUrl('');
    onIconChange('');
  };

  const isDefaultIcon = defaultIconList.includes(selectedIcon);
  const isFontAwesomeIcon = selectedIcon && selectedIcon.includes(FONT_AWESOME_IDENTIFIER);
  const isEdulutionIcon = selectedIcon && selectedIcon.includes('/edulution/edu_');
  const hasCustomIcon = selectedIcon && !isDefaultIcon && !isFontAwesomeIcon && !isEdulutionIcon;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">{t('appstore.edulutionIcons')}</p>
        <Card
          className="overflow-hidden p-0 transition-none hover:scale-100"
          variant="dialog"
        >
          <div
            className="overflow-y-auto scrollbar-thin"
            style={{ maxHeight: 140 }}
          >
            <div className="grid grid-cols-8 gap-2 p-2 sm:grid-cols-10">
              {defaultIconList.map((icon) => {
                const iconName = icon.split('/').at(-1);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelectDefaultIcon(icon)}
                    className={cn(
                      'rounded-lg border-2 transition-colors hover:border-secondary',
                      selectedIcon === icon ? 'border-primary' : 'border-transparent',
                    )}
                  >
                    <img
                      src={icon}
                      alt={iconName}
                      className="h-11 w-11 light:icon-light-mode"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('appstore.moreIcons')}</p>
        <FontAwesomeIconGrid
          selectedIcon={selectedIcon}
          onIconSelect={handleSelectFontAwesomeIcon}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t('appstore.uploadIcon')}</p>
        <DropZone
          onDrop={handleDrop}
          accept={{
            'image/svg+xml': ['.svg'],
            'image/webp': ['.webp'],
          }}
          dragActiveText={t('filesharingUpload.dropHere')}
          inactiveText={t('appstore.dropIconDescription')}
        />
      </div>

      {selectedIcon && (
        <div>
          <p className="mb-2 text-sm font-medium">{t('preview.image')}</p>
          <div className="relative inline-block rounded-xl border border-accent p-3 shadow-sm">
            <IconWrapper
              iconSrc={displayIconUrl}
              alt={t('preview.image')}
              className="h-16 w-16 object-contain"
              width={64}
              height={64}
            />
            {hasCustomIcon && (
              <Button
                type="button"
                onClick={handleDeleteIcon}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-ciRed p-1 hover:bg-ciRed/80"
              >
                <FontAwesomeIcon
                  icon={DeleteIcon}
                  className="h-4 w-4 text-white"
                />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppConfigIconEditor;
