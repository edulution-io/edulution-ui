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

import React from 'react';
import { render, screen } from '@testing-library/react';
import type ChatMessage from '@libs/chat/types/chatMessage';
import ChatBubble from './ChatBubble';

const createMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello world',
  createdAt: '2026-03-10T14:30:00.000Z',
  createdBy: 'alice',
  createdByUserFirstName: 'Alice',
  createdByUserLastName: 'Smith',
  ...overrides,
});

describe('ChatBubble', () => {
  it('renders message content', () => {
    render(
      <ChatBubble
        message={createMessage()}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders display name for other users messages', () => {
    render(
      <ChatBubble
        message={createMessage()}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('does not render display name for own messages', () => {
    render(
      <ChatBubble
        message={createMessage()}
        isOwnMessage
      />,
    );

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('falls back to username when first/last name missing', () => {
    render(
      <ChatBubble
        message={createMessage({ createdByUserFirstName: undefined, createdByUserLastName: undefined })}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('renders avatar for other users messages', () => {
    render(
      <ChatBubble
        message={createMessage()}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
  });

  it('does not render avatar for own messages', () => {
    render(
      <ChatBubble
        message={createMessage()}
        isOwnMessage
      />,
    );

    expect(screen.queryByTestId('avatar-root')).not.toBeInTheDocument();
  });

  it('passes profile picture URL to avatar based on username', () => {
    render(
      <ChatBubble
        message={createMessage({ createdBy: 'alice' })}
        isOwnMessage={false}
      />,
    );

    const image = screen.getByTestId('avatar-image');
    expect(image).toHaveAttribute('src', '/edu-api/chat/profile-picture/alice');
  });

  it('renders fallback avatar when no createdBy', () => {
    render(
      <ChatBubble
        message={createMessage({ createdBy: undefined })}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
  });

  it('renders time string for messages', () => {
    render(
      <ChatBubble
        message={createMessage({ createdAt: '2026-03-10T14:30:00.000Z' })}
        isOwnMessage={false}
      />,
    );

    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });
});
