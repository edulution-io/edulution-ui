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

const mockWebdavShares: any[] = [];
const mockUser = { username: 'testuser' };
const mockCreateVariableSharePathname = vi.fn().mockReturnValue('/resolved/path');
const mockWebdavShare = 'my-share';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ webdavShare: mockWebdavShare }),
}));

vi.mock('@/pages/FileSharing/useFileSharingStore', () => ({
  default: () => ({ webdavShares: mockWebdavShares }),
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: () => ({ user: mockUser }),
}));

vi.mock('@/pages/FileSharing/hooks/useVariableSharePathname', () => ({
  default: () => ({ createVariableSharePathname: mockCreateVariableSharePathname }),
}));

vi.mock('@libs/filesharing/utils/replaceIpWithOrigin', () => ({
  default: (url: string) => url.replace(/https?:\/\/[\d.]+/, window.location.origin),
}));

vi.mock('@/components/ui/AdaptiveDialog', () => ({
  default: ({ isOpen, handleOpenChange, title, body }: any) =>
    isOpen ? (
      <div data-testid="adaptive-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-body">{body}</div>
      </div>
    ) : null,
}));

vi.mock('@/pages/FileSharing/Dialog/DialogBodys/WebdavInfoDialogBody', () => ({
  default: ({ baseUrl, username }: any) => (
    <div data-testid="webdav-info-body">
      <span data-testid="base-url">{baseUrl}</span>
      <span data-testid="username">{username}</span>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import WebdavInfoDialog from './WebdavInfoDialog';

describe('WebdavInfoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebdavShares.length = 0;
  });

  it('renders dialog when open', () => {
    mockWebdavShares.push({
      displayName: 'my-share',
      url: 'https://192.168.1.1/webdav',
      sharePath: '/share',
      pathVariables: {},
    });

    render(
      <WebdavInfoDialog
        isOpen
        handleClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('adaptive-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('filesharing.webdavInfo.title');
  });

  it('does not render when closed', () => {
    render(
      <WebdavInfoDialog
        isOpen={false}
        handleClose={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('adaptive-dialog')).not.toBeInTheDocument();
  });

  it('passes correct baseUrl to body', () => {
    mockWebdavShares.push({
      displayName: 'my-share',
      url: `${window.location.origin}/webdav`,
      sharePath: '/share',
      pathVariables: {},
    });

    render(
      <WebdavInfoDialog
        isOpen
        handleClose={vi.fn()}
      />,
    );

    const baseUrlEl = screen.getByTestId('base-url');
    expect(baseUrlEl.textContent).toContain('/webdav');
    expect(baseUrlEl.textContent).toContain('/resolved/path');
  });

  it('passes username to body', () => {
    mockWebdavShares.push({
      displayName: 'my-share',
      url: 'https://localhost/webdav',
      sharePath: '/share',
      pathVariables: {},
    });

    render(
      <WebdavInfoDialog
        isOpen
        handleClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('username')).toHaveTextContent('testuser');
  });

  it('handles missing share gracefully', () => {
    render(
      <WebdavInfoDialog
        isOpen
        handleClose={vi.fn()}
      />,
    );

    expect(screen.getByTestId('adaptive-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('base-url')).toHaveTextContent('');
  });
});
