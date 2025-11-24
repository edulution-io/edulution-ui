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

import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import useMedia from '@/hooks/useMedia';
import ShortcutGroup from '@libs/common/types/shortcutGroup';

interface ShortcutHintProps {
  shortcuts: ShortcutGroup[];
  className?: string;
  showOnMobile?: boolean;
}

const ShortcutHint: React.FC<ShortcutHintProps> = ({ shortcuts, className, showOnMobile = false }) => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();

  if (!showOnMobile && (isMobileView || isTabletView)) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground',
        className,
      )}
    >
      {shortcuts?.map((group) => {
        const groupKey = group.label || group.keys.map((k) => (typeof k === 'string' ? k : k.key)).join('-');
        return (
          <div
            key={groupKey}
            className="inline-flex items-center gap-1"
          >
            {group.label && <span>{t(group.label)}</span>}
            {group.keys.map((key, keyIndex) => {
              const normalizedKey = typeof key === 'string' ? { key, label: key } : key;
              return (
                <Fragment key={normalizedKey.key}>
                  <span className="rounded border-2 border-muted-light bg-muted px-1 py-0.5 text-xs">
                    {normalizedKey.label ?? normalizedKey.key}
                  </span>
                  {keyIndex < group.keys.length - 1 && <span>+</span>}
                </Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ShortcutHint;
