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
vi.mock('./hooks/useFileSharingPage', () => ({
  default: vi.fn(),
}));
vi.mock('./useFileSharingStore', () => ({
  default: vi.fn(() => ({
    fileOperationProgress: null,
    fetchFiles: vi.fn(),
    webdavShares: [],
  })),
}));
vi.mock('./FilePreview/OnlyOffice/useFileEditorStore', () => ({
  default: vi.fn(() => ({
    isFilePreviewVisible: false,
    isFilePreviewDocked: false,
  })),
}));
vi.mock('./publicShare/usePublicShareStore', () => ({
  default: vi.fn(() => ({
    fetchShares: vi.fn(),
  })),
}));
vi.mock('@/hooks/useQuotaInfo', () => ({
  default: vi.fn(() => ({ percentageUsed: 42 })),
}));
vi.mock('@/hooks/useMedia', () => ({
  default: vi.fn(() => ({ isMobileView: false, isTabletView: false })),
}));
vi.mock('./hooks/useRefreshOnFileOperationComplete', () => ({
  default: vi.fn(),
}));
vi.mock('./hooks/usePublicShareQr', () => ({
  default: () => ({ dialog: { qrCode: false }, url: '', handleClose: vi.fn() }),
}));
vi.mock('./hooks/useBreadcrumbNavigation', () => ({
  default: () => ({ handleBreadcrumbNavigate: vi.fn(), hiddenSegments: [] }),
}));
vi.mock('./hooks/useFileUploadWithReplace', () => ({
  default: () => ({ handleFileUploadWithDuplicateCheck: vi.fn() }),
}));
vi.mock('./Table/DirectoryBreadcrumb', () => ({
  default: ({ path }: { path: string }) => <div data-testid="directory-breadcrumb">{path}</div>,
}));
vi.mock('./Table/FileSharingTable', () => ({
  default: () => <div data-testid="file-sharing-table" />,
}));
vi.mock('./Dialog/ActionContentDialog', () => ({ default: () => null }));
vi.mock('./publicShare/dialog/DownloadPublicShareDialog', () => ({ default: () => null }));
vi.mock('@/components/shared/SharePublicQRDialog', () => ({ default: () => null }));
vi.mock('./publicShare/dialog/CreateOrEditPublicShareDialog', () => ({ default: () => null }));
vi.mock('./publicShare/dialog/DeletePublicShareDialog', () => ({ default: () => null }));
vi.mock('./Dialog/UploadFileDialog', () => ({ default: () => null }));
vi.mock('./Dialog/ReplaceFilesDialog', () => ({ default: () => null }));
vi.mock('./FloatingButtonsBar/FileSharingFloatingButtonsBar', () => ({ default: () => null }));
vi.mock('@/components/ui/FileDropZone', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="file-drop-zone">{children}</div>,
}));
vi.mock('./utilities/QuotaLimitInfo', () => ({
  default: ({ percentageUsed }: { percentageUsed: number }) => (
    <div data-testid="quota-limit-info">{percentageUsed}%</div>
  ),
}));

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import type { ReactNode } from 'react';
import useFileSharingPage from './hooks/useFileSharingPage';
import useFileEditorStore from './FilePreview/OnlyOffice/useFileEditorStore';
import FileSharingPage from './FileSharingPage';

const testI18n = i18n.createInstance();
testI18n.init({ lng: 'cimode', resources: {}, interpolation: { escapeValue: false } });

const renderPage = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/filesharing/home']}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </MemoryRouter>
  );

  return render(
    <Wrapper>
      <Routes>
        <Route
          path="/filesharing/:webdavShare"
          element={<FileSharingPage />}
        />
      </Routes>
    </Wrapper>,
  );
};

describe('FileSharingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFileSharingPage).mockReturnValue({
      isFileProcessing: false,
      currentPath: '/home/documents',
      searchParams: new URLSearchParams(),
      setSearchParams: vi.fn(),
      isLoading: false,
    } as never);
    vi.mocked(useFileEditorStore).mockReturnValue({
      isFilePreviewVisible: false,
      isFilePreviewDocked: false,
    } as never);
  });

  it('renders DirectoryBreadcrumb with currentPath', () => {
    renderPage();

    const breadcrumb = screen.getByTestId('directory-breadcrumb');
    expect(breadcrumb).toHaveTextContent('/home/documents');
  });

  it('renders FileSharingTable', () => {
    renderPage();

    expect(screen.getByTestId('file-sharing-table')).toBeInTheDocument();
  });

  it('renders QuotaLimitInfo with percentage', () => {
    renderPage();

    const quota = screen.getByTestId('quota-limit-info');
    expect(quota).toHaveTextContent('42%');
  });

  it('shows LoadingIndicatorDialog when isLoading is true', () => {
    vi.mocked(useFileSharingPage).mockReturnValue({
      isFileProcessing: false,
      currentPath: '/home',
      searchParams: new URLSearchParams(),
      setSearchParams: vi.fn(),
      isLoading: true,
    } as never);

    renderPage();

    const portal = document.body.querySelector('.fixed.inset-0');
    expect(portal).toBeInTheDocument();
  });

  it('shows HorizontalLoader when isFileProcessing is true', () => {
    vi.mocked(useFileSharingPage).mockReturnValue({
      isFileProcessing: true,
      currentPath: '/home',
      searchParams: new URLSearchParams(),
      setSearchParams: vi.fn(),
      isLoading: false,
    } as never);

    const { container } = renderPage();

    const horizontalLoader = container.querySelector('[class*="w-\\[99\\%\\]"]');
    expect(horizontalLoader).toBeInTheDocument();
  });

  it('renders file preview container when isFilePreviewVisible is true', () => {
    vi.mocked(useFileEditorStore).mockReturnValue({
      isFilePreviewVisible: true,
      isFilePreviewDocked: false,
    } as never);

    const { container } = renderPage();

    const previewContainer = container.querySelector('#file-sharing-file-preview-element-id');
    expect(previewContainer).toBeInTheDocument();
  });

  it('renders FileDropZone wrapper for drag-and-drop upload', () => {
    renderPage();

    const dropZone = screen.getByTestId('file-drop-zone');
    expect(dropZone).toBeInTheDocument();
    expect(within(dropZone).getByTestId('file-sharing-table')).toBeInTheDocument();
  });

  it('renders file sharing table nested inside FileDropZone', () => {
    renderPage();

    const dropZone = screen.getByTestId('file-drop-zone');
    const table = within(dropZone).getByTestId('file-sharing-table');
    expect(table).toBeInTheDocument();
  });
});
