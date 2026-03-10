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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }));
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./PublicSurveyAccessForm', () => ({
  default: () => <div data-testid="public-access-form" />,
}));
vi.mock('./SurveyParticipationModel', () => ({
  default: ({ isPublic }: { isPublic: boolean }) => (
    <div
      data-testid="survey-participation-model"
      data-is-public={String(isPublic)}
    />
  ),
}));
vi.mock('./PublicSurveyParticipationIdDisplay', () => ({
  default: ({ publicUserId }: { publicUserId: string }) => <div data-testid="public-id-display">{publicUserId}</div>,
}));

const { mockUseSurveyTablesPageStore, mockUseParticipateSurveyStore, mockUseUserStore, mockSetAttendee } = vi.hoisted(
  () => ({
    mockUseSurveyTablesPageStore: vi.fn(),
    mockUseParticipateSurveyStore: vi.fn(),
    mockUseUserStore: vi.fn(),
    mockSetAttendee: vi.fn(),
  }),
);

vi.mock('@/pages/Surveys/Tables/useSurveysTablesPageStore', () => ({
  default: mockUseSurveyTablesPageStore,
}));
vi.mock('./useParticipateSurveyStore', () => ({
  default: mockUseParticipateSurveyStore,
}));
vi.mock('@/store/UserStore/useUserStore', () => ({
  default: mockUseUserStore,
}));

import React from 'react';
import { screen } from '@testing-library/react';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import AccessAndParticipateSurvey from './AccessAndParticipateSurvey';

describe('AccessAndParticipateSurvey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSurveyTablesPageStore.mockReturnValue({
      selectedSurvey: { id: 'survey-1', canUpdateFormerAnswer: false, canSubmitMultipleAnswers: false },
    });
    mockUseParticipateSurveyStore.mockReturnValue({
      attendee: undefined,
      setAttendee: mockSetAttendee,
      publicUserId: undefined,
    });
    mockUseUserStore.mockReturnValue({ user: null });
  });

  it('renders PublicSurveyAccessForm when no attendee is set', () => {
    renderWithProviders(<AccessAndParticipateSurvey isPublic={false} />);

    expect(screen.getByTestId('public-access-form')).toBeInTheDocument();
  });

  it('renders SurveyParticipationModel when user is logged in', () => {
    mockUseUserStore.mockReturnValue({
      user: { username: 'test', firstName: 'Test', lastName: 'User' },
    });
    mockUseParticipateSurveyStore.mockReturnValue({
      attendee: { username: 'test', firstName: 'Test', lastName: 'User', label: 'Test User', value: 'test' },
      setAttendee: mockSetAttendee,
      publicUserId: undefined,
    });

    renderWithProviders(<AccessAndParticipateSurvey isPublic={false} />);

    const model = screen.getByTestId('survey-participation-model');
    expect(model).toBeInTheDocument();
    expect(model).toHaveAttribute('data-is-public', 'false');
  });

  it('passes isPublic=true to SurveyParticipationModel', () => {
    mockUseUserStore.mockReturnValue({
      user: { username: 'test', firstName: 'Test', lastName: 'User' },
    });
    mockUseParticipateSurveyStore.mockReturnValue({
      attendee: { username: 'test', firstName: 'Test', lastName: 'User', label: 'Test User', value: 'test' },
      setAttendee: mockSetAttendee,
      publicUserId: undefined,
    });

    renderWithProviders(<AccessAndParticipateSurvey isPublic />);

    const model = screen.getByTestId('survey-participation-model');
    expect(model).toHaveAttribute('data-is-public', 'true');
  });

  it('renders PublicSurveyParticipationIdDisplay for public survey with canUpdateFormerAnswer', () => {
    mockUseUserStore.mockReturnValue({
      user: { username: 'test', firstName: 'Test', lastName: 'User' },
    });
    mockUseParticipateSurveyStore.mockReturnValue({
      attendee: { username: 'test', firstName: 'Test', lastName: 'User', label: 'Test User', value: 'test' },
      setAttendee: mockSetAttendee,
      publicUserId: 'pub-123',
    });
    mockUseSurveyTablesPageStore.mockReturnValue({
      selectedSurvey: { id: 'survey-1', canUpdateFormerAnswer: true, canSubmitMultipleAnswers: false },
    });

    renderWithProviders(<AccessAndParticipateSurvey isPublic />);

    const display = screen.getByTestId('public-id-display');
    expect(display).toBeInTheDocument();
    expect(display).toHaveTextContent('pub-123');
  });

  it('calls setAttendee with user data when user exists', () => {
    mockUseUserStore.mockReturnValue({
      user: { username: 'test', firstName: 'Test', lastName: 'User' },
    });

    renderWithProviders(<AccessAndParticipateSurvey isPublic={false} />);

    expect(mockSetAttendee).toHaveBeenCalledWith(expect.objectContaining({ username: 'test' }));
  });
});
