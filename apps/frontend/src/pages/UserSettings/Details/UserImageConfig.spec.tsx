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

/* eslint-disable @typescript-eslint/no-explicit-any */

const { mockPatchUserDetails, mockToastError } = vi.hoisted(() => ({
  mockPatchUserDetails: vi.fn().mockResolvedValue(undefined),
  mockToastError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/AvatarSH', () => ({
  AvatarSH: ({ children, className, ...props }: any) => (
    <div
      data-testid="avatar-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) =>
    src ? (
      <img
        data-testid="avatar-image"
        src={src}
        alt={alt}
        {...props}
      />
    ) : null,
  AvatarFallback: ({ children, ...props }: any) => (
    <span
      data-testid="avatar-fallback"
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@/store/useLmnApiStore', () => ({
  default: () => ({
    user: { name: 'testuser', givenName: 'Test', sn: 'User', thumbnailPhoto: 'existing-photo' },
    patchUserDetails: mockPatchUserDetails,
  }),
}));

vi.mock('@/utils/getCompressedImage', () => ({
  default: vi.fn().mockResolvedValue('compressed-base64'),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CHAT_PROFILE_PICTURE_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import server from '@libs/test-utils/msw/server';
import UserImageConfig from './UserImageConfig';

const PROFILE_PICTURE_URL = `/${EDU_API_ROOT}/${CHAT_PROFILE_PICTURE_ENDPOINT}`;

describe('UserImageConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(http.put(PROFILE_PICTURE_URL, () => new HttpResponse(null, { status: 200 })));
  });

  it('renders avatar with existing photo', () => {
    render(<UserImageConfig />);

    expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<UserImageConfig />);

    expect(screen.getByText('common.save')).toBeInTheDocument();
  });

  it('renders delete button when image exists', () => {
    render(<UserImageConfig />);

    expect(screen.getByText('common.delete')).toBeInTheDocument();
  });

  it('calls patchUserDetails and updates chat cache on save', async () => {
    render(<UserImageConfig />);

    fireEvent.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockPatchUserDetails).toHaveBeenCalledWith({ thumbnailPhoto: 'existing-photo' });
    });
  });

  it('calls patchUserDetails with empty string on delete', async () => {
    render(<UserImageConfig />);

    fireEvent.click(screen.getByText('common.delete'));

    await waitFor(() => {
      expect(mockPatchUserDetails).toHaveBeenCalledWith({ thumbnailPhoto: '' });
    });
  });

  it('shows toast error when chat cache update fails on save', async () => {
    server.use(http.put(PROFILE_PICTURE_URL, () => HttpResponse.json(null, { status: 500 })));

    render(<UserImageConfig />);

    fireEvent.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('usersettings.errors.profilePictureCacheUpdateFailed');
    });
  });

  it('shows toast error when chat cache update fails on delete', async () => {
    server.use(http.put(PROFILE_PICTURE_URL, () => HttpResponse.json(null, { status: 500 })));

    render(<UserImageConfig />);

    fireEvent.click(screen.getByText('common.delete'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('usersettings.errors.profilePictureCacheUpdateFailed');
    });
  });
});
