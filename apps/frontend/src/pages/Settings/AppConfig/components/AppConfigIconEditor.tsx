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
import { Button } from '@/components/shared/Button';
import cn from '@libs/common/utils/className';
import getAppIconClassName from '@/utils/getAppIconClassName';
import DropZone from '@/components/ui/DropZone';
import defaultIconList from './defaultIconList';

interface AppConfigIconEditorProps {
  currentIcon: string;
  onIconChange: (icon: string) => void;
}

const AppConfigIconEditor: React.FC<AppConfigIconEditorProps> = ({ currentIcon, onIconChange }) => {
  const { t } = useTranslation();
  const [selectedIcon, setSelectedIcon] = useState<string>(currentIcon);

  useEffect(() => {
    setSelectedIcon(currentIcon);
  }, [currentIcon]);

  const handleSelectDefaultIcon = (icon: string) => {
    setSelectedIcon(icon);
    onIconChange(icon);
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setSelectedIcon(dataUrl);
          onIconChange(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [onIconChange],
  );

  const handleDeleteIcon = () => {
    setSelectedIcon('');
    onIconChange('');
  };

  const isDefaultIcon = defaultIconList.includes(selectedIcon);
  const hasCustomIcon = selectedIcon && !isDefaultIcon;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">{t('appstore.chooseIcon')}</p>
        <Card
          className="grid grid-cols-6 gap-4 p-3 transition-none hover:scale-100"
          variant="dialog"
        >
          {defaultIconList.map((icon) => {
            const iconName = icon.split('/').at(-1);
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => handleSelectDefaultIcon(icon)}
                className={cn(
                  'rounded-xl border-2 transition-colors hover:border-secondary',
                  selectedIcon === icon ? 'border-primary' : 'border-transparent',
                )}
              >
                <img
                  src={icon}
                  alt={iconName}
                  className="h-14 w-14 light:icon-light-mode"
                />
              </button>
            );
          })}
        </Card>
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
            <img
              src={selectedIcon}
              alt={t('preview.image')}
              className={cn('h-16 w-16 object-contain', isDefaultIcon && getAppIconClassName(selectedIcon))}
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
