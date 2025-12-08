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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccordionContent, AccordionItem } from '@/components/ui/AccordionSH';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useIsAppActive from '@/hooks/useIsAppActive';
import TApps from '@libs/appconfig/types/appsType';

interface FeedAccordionItemProps<T> {
  appKey: TApps;
  icon: string;
  listItems: T[];
  ListComponent: React.ComponentType<{ items: T[]; className?: string }>;
  isVisible?: boolean;
}

const FeedAccordionItem = <T,>({
  appKey,
  icon,
  listItems,
  ListComponent,
  isVisible = true,
}: FeedAccordionItemProps<T>) => {
  const { t } = useTranslation();
  const isActive = useIsAppActive(appKey);

  if (!isActive || !isVisible) {
    return null;
  }

  return (
    <AccordionItem value={appKey}>
      <FeedWidgetAccordionTrigger
        src={icon}
        alt={`${appKey}-notification-icon`}
        labelTranslationId={`${appKey}.sidebar`}
      />
      <AccordionContent className="pb-2">
        {listItems && listItems.length > 0 ? (
          <ListComponent
            items={listItems}
            className="my-2"
          />
        ) : (
          <span className="my-2 text-center text-sm">{t(`feed.no${appKey}`)}</span>
        )}
      </AccordionContent>
      <hr className="mb-6 mt-2 border-muted-foreground" />
    </AccordionItem>
  );
};

export default FeedAccordionItem;
