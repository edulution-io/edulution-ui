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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('@/hooks/usePortalRoot', () => ({
  default: () => document.getElementById('portal-root'),
}));

vi.mock('@/hooks/useFooterColors', () => ({
  default: () => null,
}));

vi.mock('@/components/ui/FloatingActionButton', () => ({
  default: ({ text, onClick }: { text: string; onClick?: () => void }) => (
    <button
      type="button"
      data-testid={`fab-${text}`}
      onClick={onClick}
    >
      {text}
    </button>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@libs/ui/utils/calculateButtonLayout', () => ({
  default: vi.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import FloatingButtonsBar from './FloatingButtonsBar';
import calculateButtonLayout from '@libs/ui/utils/calculateButtonLayout';
import FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';

const BUTTONS: FloatingButtonConfig[] = [
  { icon: faPlus, text: 'Add', onClick: vi.fn() },
  { icon: faSave, text: 'Save', onClick: vi.fn() },
  { icon: faTrash, text: 'Delete', onClick: vi.fn() },
];

const setupPortalRoot = () => {
  const portalRoot = document.createElement('div');
  portalRoot.id = 'portal-root';
  Object.defineProperty(portalRoot, 'getBoundingClientRect', {
    value: () => ({ width: 800, height: 60, top: 0, left: 0, right: 800, bottom: 60 }),
  });
  document.body.appendChild(portalRoot);
  return portalRoot;
};

describe('FloatingButtonsBar', () => {
  let portalRoot: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    portalRoot = setupPortalRoot();
    vi.mocked(calculateButtonLayout).mockReturnValue({
      hasOverflow: false,
      displayedButtons: BUTTONS,
      overflowButtons: [],
    });
  });

  afterEach(() => {
    portalRoot.remove();
  });

  it('renders all visible buttons when no overflow', () => {
    render(<FloatingButtonsBar config={{ buttons: BUTTONS, keyPrefix: 'test-' }} />);

    expect(screen.getByTestId('fab-Add')).toBeInTheDocument();
    expect(screen.getByTestId('fab-Save')).toBeInTheDocument();
    expect(screen.getByTestId('fab-Delete')).toBeInTheDocument();
  });

  it('does not render buttons with isVisible false', () => {
    const buttonsWithHidden: FloatingButtonConfig[] = [
      { icon: faPlus, text: 'Add', onClick: vi.fn() },
      { icon: faSave, text: 'Save', onClick: vi.fn(), isVisible: false },
    ];

    vi.mocked(calculateButtonLayout).mockReturnValue({
      hasOverflow: false,
      displayedButtons: [buttonsWithHidden[0]],
      overflowButtons: [],
    });

    render(<FloatingButtonsBar config={{ buttons: buttonsWithHidden, keyPrefix: 'test-' }} />);

    expect(screen.getByTestId('fab-Add')).toBeInTheDocument();
    expect(screen.queryByTestId('fab-Save')).not.toBeInTheDocument();
  });

  it('calls onClick when a button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const buttons: FloatingButtonConfig[] = [{ icon: faPlus, text: 'Add', onClick: handleClick }];

    vi.mocked(calculateButtonLayout).mockReturnValue({
      hasOverflow: false,
      displayedButtons: buttons,
      overflowButtons: [],
    });

    render(<FloatingButtonsBar config={{ buttons, keyPrefix: 'test-' }} />);

    await user.click(screen.getByTestId('fab-Add'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows more button when overflow exists', () => {
    vi.mocked(calculateButtonLayout).mockReturnValue({
      hasOverflow: true,
      displayedButtons: [BUTTONS[0]],
      overflowButtons: [BUTTONS[1], BUTTONS[2]],
    });

    render(<FloatingButtonsBar config={{ buttons: BUTTONS, keyPrefix: 'test-' }} />);

    expect(screen.getByTestId('fab-Add')).toBeInTheDocument();
    expect(screen.getByText('common.more')).toBeInTheDocument();
  });

  it('returns null when portal root is not available', () => {
    portalRoot.remove();

    const { container } = render(<FloatingButtonsBar config={{ buttons: BUTTONS, keyPrefix: 'test-' }} />);

    expect(container.innerHTML).toBe('');

    portalRoot = setupPortalRoot();
  });
});
