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
import cn from '@libs/common/utils/className';
import { AccordionTrigger } from '@/components/ui/AccordionSH';

interface FeedWidgetAccordionTriggerProps {
  src: string;
  alt: string;
  labelTranslationId: string;
  className?: string;
  width?: string;
}

const FeedWidgetAccordionTrigger = (props: FeedWidgetAccordionTriggerProps) => {
  const { src, alt, labelTranslationId, className, width = '40px' } = props;

  const { t } = useTranslation();

  return (
    <AccordionTrigger className="flex pb-2 pt-0 text-xl font-bold">
      {t(labelTranslationId)}
      <img
        src={src}
        alt={alt}
        className={cn('ml-4', className)}
        width={width}
      />
    </AccordionTrigger>
  );
};

export default FeedWidgetAccordionTrigger;
