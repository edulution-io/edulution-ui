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

import React, { useEffect, useMemo, useState } from 'react';
import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';
import { cn } from '@edulution-io/ui-kit';
import AnchorSection from '@/components/shared/AnchorSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import useSubMenuStore from '@/store/useSubMenuStore';
import Section from '@libs/frontend/menubar/section';
import { HASH_SCROLL_DELAY_MS } from '@libs/ui/constants/animationTiming';

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

const getSections = (children: React.ReactNode): Section[] => {
  const sections: Section[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<SectionAccordionItemProps>(child) && child.props.id) {
      sections.push({ id: child.props.id, label: child.props.label });
    }
  });
  return sections;
};

const SectionAccordion: React.FC<SectionAccordionProps> = ({
  children,
  defaultOpen = [],
  defaultOpenAll = false,
  className,
}) => {
  const { sectionToOpen, clearOpenRequest, setSections } = useSubMenuStore();
  const sections = useMemo(() => getSections(children), [children]);
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (defaultOpenAll) {
      return sectionIds;
    }
    return defaultOpen;
  });

  useEffect(() => {
    setSections(sections);
    return () => setSections([]);
  }, [sections, setSections]);

  useEffect(() => {
    if (!sectionToOpen) return;

    if (!openItems.includes(sectionToOpen)) {
      setOpenItems((prev) => [...prev, sectionToOpen]);
    }

    clearOpenRequest();
  }, [sectionToOpen, openItems, clearOpenRequest]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setOpenItems((prev) => (prev.includes(hash) ? prev : [...prev, hash]));

      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, HASH_SCROLL_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
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
    <Root
      type="multiple"
      value={openItems}
      onValueChange={handleValueChange}
      className={cn('w-full space-y-4 pb-4', className)}
    >
      {children}
    </Root>
  );
};

const SectionAccordionItem: React.FC<SectionAccordionItemProps> = ({
  id,
  label,
  children,
  className,
  variant = 'default',
}) => {
  const activeSection = useSubMenuStore((state) => state.activeSection);
  const isHighlighted = activeSection === id;

  return (
    <Item
      value={id}
      className={cn(
        'text-card-foreground transition-all duration-300',
        variant === 'default' && 'bg-glass rounded-xl backdrop-blur-lg dark:bg-muted-background',
        isHighlighted && 'blinking',
        className,
      )}
    >
      <AnchorSection id={id}>
        <Header className="flex">
          <Trigger
            className={cn(
              'flex flex-1 items-center justify-between py-4 text-base font-semibold leading-none tracking-tight',
              'transition-all [&[data-state=open]>svg]:rotate-180',
              variant === 'default' && 'px-6',
            )}
          >
            <h3>{label}</h3>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
            />
          </Trigger>
        </Header>
        <Content
          className={cn(
            'overflow-hidden text-sm',
            'data-[state=closed]:animate-accordion-up',
            'data-[state=open]:animate-accordion-down',
          )}
        >
          <div className={cn('pb-6 pt-0', variant === 'default' && 'px-6')}>{children}</div>
        </Content>
      </AnchorSection>
    </Item>
  );
};

export { SectionAccordion, SectionAccordionItem };
