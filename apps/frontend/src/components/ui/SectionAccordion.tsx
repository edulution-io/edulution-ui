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

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import cn from '@libs/common/utils/className';
import AnchorSection from '@/components/shared/AnchorSection';

interface SectionAccordionProps {
  children: React.ReactNode;
  defaultOpen?: string[];
  defaultOpenAll?: boolean;
  className?: string;
}

interface SectionAccordionItemProps {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent';
}

const SectionAccordion: React.FC<SectionAccordionProps> = ({
  children,
  defaultOpen = [],
  defaultOpenAll = false,
  className,
}) => {
  const isInitialized = useRef(false);
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  useEffect(() => {
    if (isInitialized.current) return;

    if (defaultOpenAll) {
      const ids: string[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement<SectionAccordionItemProps>(child) && child.props.id) {
          ids.push(child.props.id);
        }
      });
      setOpenItems(ids);
    }

    isInitialized.current = true;
  }, [children, defaultOpenAll]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setOpenItems((prev) => (prev.includes(hash) ? prev : [...prev, hash]));

      setTimeout(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  const handleValueChange = (value: string[]) => {
    setOpenItems(value);

    if (value.length === 1) {
      window.history.replaceState(null, '', `#${value[0]}`);
    } else if (value.length === 0) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={openItems}
      onValueChange={handleValueChange}
      className={cn('space-y-4', className)}
    >
      {children}
    </AccordionPrimitive.Root>
  );
};

const SectionAccordionItem: React.FC<SectionAccordionItemProps> = ({
  id,
  label,
  children,
  className,
  variant = 'default',
}) => (
  <AccordionPrimitive.Item
    value={id}
    className={cn('text-card-foreground', variant === 'default' && 'rounded-xl bg-muted-background', className)}
  >
    <AnchorSection id={id}>
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            'flex flex-1 items-center justify-between py-4 text-base font-semibold leading-none tracking-tight',
            'transition-all [&[data-state=open]>svg]:rotate-180',
            variant === 'default' && 'px-6',
          )}
        >
          <h3>{label}</h3>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className={cn(
          'overflow-hidden text-sm',
          'data-[state=closed]:animate-accordion-up',
          'data-[state=open]:animate-accordion-down',
        )}
      >
        <div className={cn('pb-6 pt-0', variant === 'default' && 'px-6')}>{children}</div>
      </AccordionPrimitive.Content>
    </AnchorSection>
  </AccordionPrimitive.Item>
);

export { SectionAccordion, SectionAccordionItem };
