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

vi.mock('i18next', () => ({
  t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
}));

import formatEstimatedTimeRemaining from './formatEstimatedTimeRemaining';

describe('formatEstimatedTimeRemaining', () => {
  it('returns dash for undefined', () => {
    expect(formatEstimatedTimeRemaining(undefined)).toBe('\u2013');
  });

  it('returns dash for null', () => {
    expect(formatEstimatedTimeRemaining(null as unknown as number)).toBe('\u2013');
  });

  it('returns dash for NaN', () => {
    expect(formatEstimatedTimeRemaining(NaN)).toBe('\u2013');
  });

  it('returns dash for negative values', () => {
    expect(formatEstimatedTimeRemaining(-5)).toBe('\u2013');
  });

  it('returns dash for Infinity', () => {
    expect(formatEstimatedTimeRemaining(Infinity)).toBe('\u2013');
  });

  it('returns fewSeconds key for < 5 seconds', () => {
    expect(formatEstimatedTimeRemaining(3)).toBe('filesharing.eta.fewSeconds');
  });

  it('returns fewSeconds key for 0 seconds', () => {
    expect(formatEstimatedTimeRemaining(0)).toBe('filesharing.eta.fewSeconds');
  });

  it('returns lessThanMinute key for < 60 seconds', () => {
    expect(formatEstimatedTimeRemaining(30)).toBe('filesharing.eta.lessThanMinute');
  });

  it('returns aboutOneMinute key for < 90 seconds', () => {
    expect(formatEstimatedTimeRemaining(70)).toBe('filesharing.eta.aboutOneMinute');
  });

  it('returns aboutMinutes key for < 3600 seconds', () => {
    const result = formatEstimatedTimeRemaining(300);
    expect(result).toContain('filesharing.eta.aboutMinutes');
  });

  it('returns aboutHours key when remainder <= 5 minutes', () => {
    const result = formatEstimatedTimeRemaining(3600);
    expect(result).toContain('filesharing.eta.aboutHours');
  });

  it('returns moreThanHours key when remainder > 5 minutes', () => {
    const result = formatEstimatedTimeRemaining(3960);
    expect(result).toContain('filesharing.eta.moreThanHours');
  });

  it('returns aboutDays key when hours remainder <= 6', () => {
    const result = formatEstimatedTimeRemaining(86400);
    expect(result).toContain('filesharing.eta.aboutDays');
  });

  it('returns moreThanDays key when hours remainder > 6', () => {
    const result = formatEstimatedTimeRemaining(86400 + 25200);
    expect(result).toContain('filesharing.eta.moreThanDays');
  });
});
