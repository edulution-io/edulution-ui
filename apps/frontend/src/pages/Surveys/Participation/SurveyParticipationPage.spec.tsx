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
vi.mock('@/pages/Surveys/theme/custom.participation.css', () => ({}));
vi.mock('@/pages/Surveys/Participation/AccessAndParticipateSurvey', () => ({
  default: () => <div data-testid="access-participate-survey" />,
}));
vi.mock('@/components/structure/layout/PageLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="page-layout">{children}</div>,
}));
vi.mock('@/components/ui/Loading/CircleLoader', () => ({
  default: ({ className }: { className?: string }) => (
    <div
      data-testid="circle-loader"
      className={className}
    />
  ),
}));

const {
  mockFetchSelectedSurvey,
  mockResetSurvey,
  mockResetParticipation,
  mockUseSurveyTablesPageStore,
  mockUseParticipateSurveyStore,
} = vi.hoisted(() => ({
  mockFetchSelectedSurvey: vi.fn().mockResolvedValue(undefined),
  mockResetSurvey: vi.fn(),
  mockResetParticipation: vi.fn(),
  mockUseSurveyTablesPageStore: vi.fn(),
  mockUseParticipateSurveyStore: vi.fn(),
}));

vi.mock('@/pages/Surveys/Tables/useSurveysTablesPageStore', () => ({
  default: mockUseSurveyTablesPageStore,
}));

vi.mock('@/pages/Surveys/Participation/useParticipateSurveyStore', () => ({
  default: mockUseParticipateSurveyStore,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import type { ReactNode } from 'react';
import SurveyParticipationPage from '@/pages/Surveys/Participation/SurveyParticipationPage';

const testI18n = i18n.createInstance();
testI18n.init({ lng: 'cimode', resources: {}, interpolation: { escapeValue: false } });

const defaultSurveyStoreState = {
  selectedSurvey: null,
  isFetching: false,
  fetchSelectedSurvey: mockFetchSelectedSurvey,
  reset: mockResetSurvey,
};

const defaultParticipationStoreState = {
  reset: mockResetParticipation,
};

const renderPage = (surveyId?: string) => {
  const route = surveyId ? `/surveys/participate/${surveyId}` : '/surveys/participate';
  const path = surveyId ? '/surveys/participate/:surveyId' : '/surveys/participate';

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </MemoryRouter>
  );

  return render(
    <Wrapper>
      <Routes>
        <Route
          path={path}
          element={<SurveyParticipationPage isPublic={false} />}
        />
      </Routes>
    </Wrapper>,
  );
};

describe('SurveyParticipationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSurveyTablesPageStore.mockReturnValue(defaultSurveyStoreState);
    mockUseParticipateSurveyStore.mockReturnValue(defaultParticipationStoreState);
  });

  it('shows not found message when surveyId is undefined', () => {
    renderPage();

    expect(screen.getByText('survey.notFound')).toBeInTheDocument();
  });

  it('calls fetchSelectedSurvey with surveyId on mount', () => {
    renderPage('survey-123');

    expect(mockFetchSelectedSurvey).toHaveBeenCalledWith('survey-123', false);
  });

  it('calls reset functions on mount', () => {
    renderPage('survey-123');

    expect(mockResetSurvey).toHaveBeenCalled();
    expect(mockResetParticipation).toHaveBeenCalled();
  });

  it('shows CircleLoader when isFetching is true', () => {
    mockUseSurveyTablesPageStore.mockReturnValue({
      ...defaultSurveyStoreState,
      isFetching: true,
    });

    renderPage('survey-123');

    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('shows not found message when selectedSurvey is null after fetch', () => {
    mockUseSurveyTablesPageStore.mockReturnValue({
      ...defaultSurveyStoreState,
      isFetching: false,
      selectedSurvey: null,
    });

    renderPage('survey-123');

    expect(screen.getByText('survey.notFound')).toBeInTheDocument();
  });

  it('renders AccessAndParticipateSurvey when selectedSurvey exists', () => {
    mockUseSurveyTablesPageStore.mockReturnValue({
      ...defaultSurveyStoreState,
      isFetching: false,
      selectedSurvey: { id: 'survey-123', title: 'Test Survey' },
    });

    renderPage('survey-123');

    expect(screen.getByTestId('access-participate-survey')).toBeInTheDocument();
  });
});
