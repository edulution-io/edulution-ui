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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@edulution-io/ui-kit';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';

interface AccordionSectionProps {
  value: string;
  label: string;
  count: number;
  headerClassName: string;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ value, label, count, headerClassName, children }) => (
  <AccordionItem value={value}>
    <AccordionTrigger className={cn('rounded-md px-4', headerClassName)}>
      <div className="flex items-center gap-2">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="h-4 w-4"
        />
        <span>
          {label}: {count}
        </span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-2 pt-2">{children}</AccordionContent>
  </AccordionItem>
);

export default AccordionSection;
