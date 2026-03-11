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

vi.mock('@edulution-io/ui-kit', async () => import('@libs/test-utils/mocks/uiKitMock').then((m) => m.uiKitInputMock));

vi.mock('@/components/ui/ScrollArea', () => ({
  ScrollArea: ({ children, ...props }: any) => (
    <div
      data-testid="scroll-area"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Label', () => ({
  default: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import PropertyDialogList from './PropertyDialogList';

describe('PropertyDialogList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete warning when deleteWarningTranslationId is provided', () => {
    render(
      <PropertyDialogList
        deleteWarningTranslationId="dialog.deleteWarning"
        items={[]}
      />,
    );

    expect(screen.getByText('dialog.deleteWarning')).toBeInTheDocument();
  });

  it('does not render delete warning when deleteWarningTranslationId is not provided', () => {
    const { container } = render(<PropertyDialogList items={[]} />);

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('renders items with their values', () => {
    const items = [
      { id: '1', value: 'Value One', translationId: 'field.one' },
      { id: '2', value: 'Value Two', translationId: 'field.two' },
    ];

    render(<PropertyDialogList items={items} />);

    expect(screen.getByDisplayValue('Value One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Value Two')).toBeInTheDocument();
  });

  it('renders translated labels for items with translationId', () => {
    const items = [{ id: '1', value: 'Test', translationId: 'field.name' }];

    render(<PropertyDialogList items={items} />);

    expect(screen.getByText('field.name:')).toBeInTheDocument();
  });

  it('renders "common.not-available" when item value is empty', () => {
    const items = [{ id: '1', translationId: 'field.name' }];

    render(<PropertyDialogList items={items} />);

    expect(screen.getByDisplayValue('common.not-available')).toBeInTheDocument();
  });

  it('does not render label when item has no translationId', () => {
    const items = [{ id: '1', value: 'No Label' }];

    const { container } = render(<PropertyDialogList items={items} />);

    expect(container.querySelectorAll('label')).toHaveLength(0);
  });
});
