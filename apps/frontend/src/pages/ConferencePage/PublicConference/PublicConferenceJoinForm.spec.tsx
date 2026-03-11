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

const mockPublicUserFullName = 'Test User';
const mockStoredPasswordsByMeetingIds: Record<string, string> = {};
const mockSetStoredPasswordByMeetingId = vi.fn();
const mockSetPublicUserFullName = vi.fn();
const mockJoinConferenceUrl = '';
const mockUser: any = { username: 'testuser' };
const { mockToastError } = vi.hoisted(() => ({ mockToastError: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, opts?: any) => (opts ? `${key}:${JSON.stringify(opts)}` : key) }),
}));

vi.mock('@/pages/ConferencePage/PublicConference/usePublicConferenceStore', () => ({
  default: () => ({
    publicUserFullName: mockPublicUserFullName,
    storedPasswordsByMeetingIds: mockStoredPasswordsByMeetingIds,
    setStoredPasswordByMeetingId: mockSetStoredPasswordByMeetingId,
    setPublicUserFullName: mockSetPublicUserFullName,
  }),
}));

vi.mock('@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore', () => ({
  default: () => ({
    joinConferenceUrl: mockJoinConferenceUrl,
  }),
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: () => ({ user: mockUser }),
}));

vi.mock('@/components/ui/Form', () => ({
  Form: ({ children, ...props }: any) => (
    <div
      data-testid="form-provider"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/shared/FormField', () => ({
  default: ({ name, placeholder, type, ...props }: any) => (
    <div data-testid={`form-field-${name}`}>
      <input
        data-testid={`input-${name}`}
        name={name}
        placeholder={placeholder}
        type={type || 'text'}
      />
    </div>
  ),
}));

vi.mock('@/components/ui/Loading/CircleLoader', () => ({
  default: (props: any) => <div data-testid="circle-loader" />,
}));

vi.mock('@/components/shared/PublicAccessFormHeader', () => ({
  default: () => <div data-testid="public-access-form-header" />,
}));

vi.mock('@/components/ui/DialogFooterButtons', () => ({
  default: ({ submitButtonText, handleSubmit, ...props }: any) => (
    <div data-testid="dialog-footer-buttons">
      <button
        data-testid="submit-button"
        onClick={handleSubmit}
      >
        {submitButtonText}
      </button>
    </div>
  ),
}));

vi.mock('@libs/common/utils/getBase64String', () => ({
  decodeBase64: (val: string) => (val ? atob(val) : ''),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid={`button-${variant}`}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}));

vi.mock('@libs/conferences/types/conference.dto', () => ({
  default: class ConferenceDto {},
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicConferenceJoinForm from './PublicConferenceJoinForm';

const createMockForm = () => ({
  setValue: vi.fn(),
  handleSubmit: (fn: any) => (e?: any) => {
    e?.preventDefault?.();
    return fn();
  },
  register: vi.fn(),
  unregister: vi.fn(),
  getValues: vi.fn(),
  getFieldState: vi.fn(),
  setError: vi.fn(),
  clearErrors: vi.fn(),
  trigger: vi.fn(),
  formState: { errors: {}, isSubmitting: false, isValid: true },
  watch: vi.fn(),
  reset: vi.fn(),
  resetField: vi.fn(),
  setFocus: vi.fn(),
  control: {} as any,
});

const defaultProps = {
  meetingId: 'meeting-123',
  joinConference: vi.fn().mockResolvedValue(undefined),
  isPermittedUser: false,
  form: createMockForm() as any,
  isWaitingForConferenceToStart: false,
  setWaitingForConferenceToStart: vi.fn(),
  publicConference: { isRunning: true, password: '' } as any,
  updatePublicConference: vi.fn().mockResolvedValue({ isRunning: true }),
};

describe('PublicConferenceJoinForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockUser, { username: 'testuser' });
    Object.keys(mockStoredPasswordsByMeetingIds).forEach((key) => delete mockStoredPasswordsByMeetingIds[key]);
  });

  it('shows join again button when running, permitted, and user exists', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isPermittedUser
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: true }}
      />,
    );

    expect(screen.getByText('conferences.joinAgain')).toBeInTheDocument();
    expect(screen.queryByTestId('public-access-form-header')).not.toBeInTheDocument();
  });

  it('shows waiting state when conference not started', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart
        publicConference={{ isRunning: false }}
      />,
    );

    expect(screen.getByText('conferences.conferenceIsNotStartedYet')).toBeInTheDocument();
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
    expect(screen.getByText('conferences.tryManually')).toBeInTheDocument();
  });

  it('shows form with name field when no username', () => {
    Object.assign(mockUser, { username: '' });

    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: false }}
      />,
    );

    expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
    expect(screen.getByText('conferences.pleaseEnterYourFullName')).toBeInTheDocument();
  });

  it('does not show name field when user has username', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: false }}
      />,
    );

    expect(screen.queryByTestId('form-field-name')).not.toBeInTheDocument();
  });

  it('shows password field when conference has password', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: false, password: 'secret123' }}
      />,
    );

    expect(screen.getByTestId('form-field-password')).toBeInTheDocument();
    expect(screen.getByText('conferences.conferenceIsPasswordProtected')).toBeInTheDocument();
  });

  it('does not show password field when conference has no password', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: false, password: '' }}
      />,
    );

    expect(screen.queryByTestId('form-field-password')).not.toBeInTheDocument();
  });

  it('calls joinConference when join again button clicked', async () => {
    const user = userEvent.setup();
    const joinConference = vi.fn().mockResolvedValue(undefined);
    const updatePublicConference = vi.fn().mockResolvedValue({ isRunning: true });

    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        joinConference={joinConference}
        updatePublicConference={updatePublicConference}
        isPermittedUser
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: true }}
      />,
    );

    await user.click(screen.getByText('conferences.joinAgain'));

    expect(updatePublicConference).toHaveBeenCalled();
    expect(joinConference).toHaveBeenCalled();
  });

  it('shows error toast and sets waiting state when conference is not running on manual join', async () => {
    const user = userEvent.setup();
    const setWaitingForConferenceToStart = vi.fn();
    const joinConference = vi.fn();
    const updatePublicConference = vi.fn().mockResolvedValue({ isRunning: false });

    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        joinConference={joinConference}
        updatePublicConference={updatePublicConference}
        setWaitingForConferenceToStart={setWaitingForConferenceToStart}
        isPermittedUser
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: true }}
      />,
    );

    await user.click(screen.getByText('conferences.joinAgain'));

    expect(mockToastError).toHaveBeenCalledWith('conferences.errors.ConferenceIsNotRunning');
    expect(setWaitingForConferenceToStart).toHaveBeenCalledWith(true);
    expect(joinConference).not.toHaveBeenCalled();
  });

  it('renders dialog footer buttons in form view', () => {
    render(
      <PublicConferenceJoinForm
        {...defaultProps}
        isWaitingForConferenceToStart={false}
        publicConference={{ isRunning: false }}
      />,
    );

    expect(screen.getByTestId('dialog-footer-buttons')).toBeInTheDocument();
  });
});
