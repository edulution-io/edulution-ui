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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/ui/constants/commonClassNames', () => ({
  inputVariants: () => 'input-base',
}));

vi.mock('@/components/ui/BadgeSH', () => ({
  BadgeSH: ({ children, ...props }: any) => (
    <div
      data-testid="badge"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Label', () => ({
  default: ({ children }: any) => <label>{children}</label>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BadgeField from './BadgeField';

describe('BadgeField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "common.none" badge when value is empty', () => {
    render(<BadgeField value={[]} />);

    expect(screen.getByText('common.none')).toBeInTheDocument();
  });

  it('renders all badges from value array', () => {
    render(<BadgeField value={['Alpha', 'Beta', 'Gamma']} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders label when labelTranslationId is provided', () => {
    render(
      <BadgeField
        value={[]}
        labelTranslationId="some.label"
      />,
    );

    expect(screen.getByText('some.label')).toBeInTheDocument();
  });

  it('does not render label when labelTranslationId is not provided', () => {
    const { container } = render(<BadgeField value={[]} />);

    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('calls onChange with badge removed when remove button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <BadgeField
        value={['Alpha', 'Beta']}
        onChange={handleChange}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(handleChange).toHaveBeenCalledWith(['Beta']);
  });

  it('hides remove buttons and input when readOnly is true', () => {
    render(
      <BadgeField
        value={['Alpha']}
        readOnly
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
