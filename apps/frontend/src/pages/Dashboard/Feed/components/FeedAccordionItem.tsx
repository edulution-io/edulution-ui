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
