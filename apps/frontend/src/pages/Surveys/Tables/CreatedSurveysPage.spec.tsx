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
vi.mock('@/assets/icons', () => ({
  SurveysViewOwnIcon: () => null,
}));

const {
  mockUpdateCreatedSurveys,
  mockSelectSurvey,
  mockSetSelectedRows,
  mockHasAnswers,
  mockCanParticipate,
  mockUseStore,
} = vi.hoisted(() => ({
  mockUpdateCreatedSurveys: vi.fn().mockResolvedValue(undefined),
  mockSelectSurvey: vi.fn(),
  mockSetSelectedRows: vi.fn(),
  mockHasAnswers: vi.fn().mockReturnValue(false),
  mockCanParticipate: vi.fn().mockReturnValue(false),
  mockUseStore: vi.fn(),
}));

vi.mock('@/pages/Surveys/Tables/useSurveysTablesPageStore', () => ({
  default: mockUseStore,
}));

vi.mock('@/pages/Surveys/Tables/SurveyTablePage', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="survey-table-page">
      <span data-testid="survey-title">{String(props.title)}</span>
      <span data-testid="survey-can-delete">{String(props.canDelete)}</span>
      <span data-testid="survey-can-edit">{String(props.canEdit)}</span>
      <span data-testid="survey-count">{(props.surveys as unknown[])?.length ?? 0}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/Loading/LoadingIndicatorDialog', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div
        className="fixed inset-0"
        data-testid="loading-dialog"
      />
    ) : null,
}));

import React from 'react';
import { screen } from '@testing-library/react';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import CreatedSurveysPage from '@/pages/Surveys/Tables/CreatedSurveysPage';

const defaultStoreState = {
  createdSurveys: [],
  isFetchingCreatedSurveys: false,
  updateCreatedSurveys: mockUpdateCreatedSurveys,
  selectSurvey: mockSelectSurvey,
  setSelectedRows: mockSetSelectedRows,
  hasAnswers: mockHasAnswers,
  canParticipate: mockCanParticipate,
};

describe('CreatedSurveysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStore.mockReturnValue(defaultStoreState);
  });

  it('calls updateCreatedSurveys on mount', () => {
    renderWithProviders(<CreatedSurveysPage />);

    expect(mockUpdateCreatedSurveys).toHaveBeenCalled();
  });

  it('resets selectedRows and selectSurvey on mount', () => {
    renderWithProviders(<CreatedSurveysPage />);

    expect(mockSetSelectedRows).toHaveBeenCalledWith({});
    expect(mockSelectSurvey).toHaveBeenCalledWith(undefined);
  });

  it('shows loading dialog when isFetchingCreatedSurveys is true', () => {
    mockUseStore.mockReturnValue({
      ...defaultStoreState,
      isFetchingCreatedSurveys: true,
    });

    renderWithProviders(<CreatedSurveysPage />);

    expect(screen.getByTestId('loading-dialog')).toBeInTheDocument();
  });

  it('renders SurveyTablePage with correct props', () => {
    renderWithProviders(<CreatedSurveysPage />);

    expect(screen.getByTestId('survey-table-page')).toBeInTheDocument();
    expect(screen.getByTestId('survey-title')).toHaveTextContent('surveys.view.created.title');
    expect(screen.getByTestId('survey-can-delete')).toHaveTextContent('true');
    expect(screen.getByTestId('survey-can-edit')).toHaveTextContent('true');
  });

  it('passes surveys to SurveyTablePage when loaded', () => {
    mockUseStore.mockReturnValue({
      ...defaultStoreState,
      createdSurveys: [
        { id: '1', title: 'Survey 1' },
        { id: '2', title: 'Survey 2' },
      ],
    });

    renderWithProviders(<CreatedSurveysPage />);

    expect(screen.getByTestId('survey-count')).toHaveTextContent('2');
  });

  it('does not show loading dialog when not fetching', () => {
    renderWithProviders(<CreatedSurveysPage />);

    expect(screen.queryByTestId('loading-dialog')).not.toBeInTheDocument();
  });
});
