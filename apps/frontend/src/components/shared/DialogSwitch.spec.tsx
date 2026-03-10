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

vi.mock('@/components/ui/Switch', () => ({
  default: ({ id, checked, onCheckedChange, ...props }: any) => (
    <button
      data-testid="switch"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DialogSwitch from './DialogSwitch';

describe('DialogSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with translation text', () => {
    render(
      <DialogSwitch
        checked={false}
        onCheckedChange={vi.fn()}
        translationId="settings.enableFeature"
      />,
    );

    expect(screen.getByText('settings.enableFeature')).toBeInTheDocument();
  });

  it('shows "common.yes" label when checked', () => {
    render(
      <DialogSwitch
        checked
        onCheckedChange={vi.fn()}
        translationId="settings.enableFeature"
      />,
    );

    expect(screen.getByText('common.yes')).toBeInTheDocument();
  });

  it('shows "common.no" label when unchecked', () => {
    render(
      <DialogSwitch
        checked={false}
        onCheckedChange={vi.fn()}
        translationId="settings.enableFeature"
      />,
    );

    expect(screen.getByText('common.no')).toBeInTheDocument();
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DialogSwitch
        checked={false}
        onCheckedChange={handleChange}
        translationId="settings.enableFeature"
      />,
    );

    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
