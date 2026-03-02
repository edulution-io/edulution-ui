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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/parent-child-pairing/constants/parentChildPairingStatus', () => ({
  default: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },
}));

vi.mock('@/components/ui/BadgeSH', () => ({
  BadgeSH: ({ children, className }: any) => (
    <div
      data-testid="badge"
      className={className}
    >
      {children}
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import ParentChildPairingStatusBadge from './ParentChildPairingStatusBadge';

describe('ParentChildPairingStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pending status with correct translation key', () => {
    render(<ParentChildPairingStatusBadge status="pending" />);

    expect(screen.getByText('parentChildPairing.statusPending')).toBeInTheDocument();
  });

  it('renders accepted status with correct translation key', () => {
    render(<ParentChildPairingStatusBadge status="accepted" />);

    expect(screen.getByText('parentChildPairing.statusAccepted')).toBeInTheDocument();
  });

  it('renders rejected status with correct translation key', () => {
    render(<ParentChildPairingStatusBadge status="rejected" />);

    expect(screen.getByText('parentChildPairing.statusRejected')).toBeInTheDocument();
  });

  it('applies yellow style for pending status', () => {
    render(<ParentChildPairingStatusBadge status="pending" />);

    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-yellow-500');
  });

  it('falls back to gray style for unknown status', () => {
    render(<ParentChildPairingStatusBadge status="unknown" />);

    const badge = screen.getByTestId('badge');
    expect(badge.className).toContain('bg-gray-500');
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });
});
