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

import AxeBuilder from '@axe-core/playwright';
import { type Page, expect } from '@playwright/test';
import type { Result } from 'axe-core';

const CRITICAL_IMPACT_LEVELS = ['critical', 'serious'] as const;

type A11yScanOptions = {
  disableRules?: string[];
  includedImpacts?: string[];
};

const formatViolation = (violation: Result): string => {
  const nodes = violation.nodes.map((node) => `    - ${node.html}`).join('\n');
  return `[${violation.impact}] ${violation.id}: ${violation.help}\n  URL: ${violation.helpUrl}\n  Elements:\n${nodes}`;
};

const runAccessibilityScan = async (page: Page, options: A11yScanOptions = {}): Promise<void> => {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

  if (options.disableRules?.length) {
    builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();

  const criticalViolations = results.violations.filter((v) =>
    CRITICAL_IMPACT_LEVELS.includes(v.impact as (typeof CRITICAL_IMPACT_LEVELS)[number]),
  );

  const moderateViolations = results.violations.filter((v) => v.impact === 'moderate');

  if (moderateViolations.length > 0) {
    console.warn(
      `[a11y] ${moderateViolations.length} moderate violation(s):\n${moderateViolations.map(formatViolation).join('\n\n')}`,
    );
  }

  expect(
    criticalViolations,
    `Found ${criticalViolations.length} critical/serious a11y violation(s):\n${criticalViolations.map(formatViolation).join('\n\n')}`,
  ).toHaveLength(0);
};

export { runAccessibilityScan, formatViolation };
export type { A11yScanOptions };
