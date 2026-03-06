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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-use-before-define */

const stableWindowSize = { width: 1920, height: 1080 };

const mockCurrentlyEditingFile = {
  filename: 'test.txt',
  filePath: '/test.txt',
  basename: 'test.txt',
  etag: '123',
  lastmod: '2025-01-01',
  size: 1024,
  type: 'file' as const,
  mime: 'text/plain',
};

const mockSetIsFilePreviewVisible = vi.fn();
const mockSetIsFilePreviewDocked = vi.fn();
const mockSetCurrentlyEditingFile = vi.fn();
const mockAddFileToOpenInNewTab = vi.fn();
const mockLoadDownloadUrl = vi.fn();
const mockSetFileIsCurrentlyDisabled = vi.fn();
const mockFetchFiles = vi.fn();
const mockSetCurrentWindowedFrameSize = vi.fn();
const mockSaveFile = vi.fn();
const mockResetFileEditorContent = vi.fn();
const mockOpenUnsavedChangesDialog = vi.fn();
const mockHasUnsavedChanges = vi.fn(() => false);
const mockHasDrawioUnsavedChanges = vi.fn(() => false);

let mockFileEditorStoreState: any = {};
let mockCurrentPathname: string = '/filesharing/share1';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockCurrentPathname }),
}));

vi.mock('@/hooks/useWindowResize', () => ({
  default: () => stableWindowSize,
}));

vi.mock('@/hooks/useMedia', () => ({
  default: () => ({ isMobileView: false }),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore', () => ({
  default: () => mockFileEditorStoreState,
}));

vi.mock('@/pages/FileSharing/useFileSharingStore', () => ({
  default: () => ({
    setFileIsCurrentlyDisabled: mockSetFileIsCurrentlyDisabled,
    fetchFiles: mockFetchFiles,
    currentPath: '/share1',
  }),
}));

vi.mock('@/pages/FileSharing/useFileSharingDownloadStore', () => ({
  default: () => ({
    loadDownloadUrl: mockLoadDownloadUrl,
  }),
}));

vi.mock('@/components/structure/framing/useFrameStore', () => ({
  default: () => ({
    setCurrentWindowedFrameSize: mockSetCurrentWindowedFrameSize,
  }),
}));

vi.mock('@/pages/FileSharing/FilePreview/useFileEditorContentStore', () => ({
  default: () => ({
    hasUnsavedChanges: mockHasUnsavedChanges,
    hasDrawioUnsavedChanges: mockHasDrawioUnsavedChanges,
    openUnsavedChangesDialog: mockOpenUnsavedChangesDialog,
    isSaving: false,
    saveFile: mockSaveFile,
    reset: mockResetFileEditorContent,
  }),
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: () => ({ appConfigs: [] }),
}));

vi.mock('@/components/structure/framing/ResizableWindow/ResizableWindow', () => ({
  default: (props: any) => React.createElement('div', { 'data-testid': 'resizable-window' }, props.children),
}));

vi.mock('@/pages/FileSharing/FilePreview/FileRenderer', () => ({
  default: () => React.createElement('div', { 'data-testid': 'file-renderer' }),
}));

vi.mock('@/pages/FileSharing/FilePreview/TextEditor/UnsavedChangesDialog', () => ({
  default: () => React.createElement('div', { 'data-testid': 'unsaved-dialog' }),
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/OpenInNewTabButton', () => ({
  default: () => null,
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/ToggleEditModeButton', () => ({
  default: () => null,
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/SaveButton', () => ({
  default: () => null,
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/PrintButton', () => ({
  default: () => null,
}));

vi.mock('@/components/structure/framing/ResizableWindow/Buttons/ToggleDockButton', () => ({
  default: () => null,
}));

vi.mock('@libs/filesharing/utils/isOnlyOfficeDocument', () => ({
  default: () => false,
}));

vi.mock('@libs/filesharing/utils/isTextExtension', () => ({
  default: () => true,
}));

vi.mock('@libs/filesharing/utils/isDrawioExtension', () => ({
  default: () => false,
}));

vi.mock('@libs/filesharing/utils/getFileExtension', () => ({
  default: () => 'txt',
}));

vi.mock('@libs/filesharing/utils/isValidFileToPreview', () => ({
  default: () => true,
}));

vi.mock('@libs/filesharing/constants/filePreviewElementId', () => ({
  default: 'file-preview',
}));

vi.mock('@libs/filesharing/constants/routes', () => ({
  default: 'file-preview',
}));

vi.mock('@libs/filesharing/constants/textPreviewElementId', () => ({
  default: 'text-preview',
}));

vi.mock('@libs/filesharing/types/contentType', () => ({
  default: { FILE: 'file', DIRECTORY: 'directory' },
}));

vi.mock('@libs/appconfig/utils/getExtendedOptionsValue', () => ({
  default: () => null,
}));

vi.mock('@libs/appconfig/constants/apps', () => ({
  default: { FILE_SHARING: 'filesharing' },
}));

vi.mock('@libs/appconfig/constants/extendedOptionKeys', () => ({
  default: { ONLY_OFFICE_URL: 'onlyOfficeUrl' },
}));

vi.mock('@libs/ui/constants/resizableWindowDefaultPosition', () => ({
  default: { x: 50, y: 50 },
}));

vi.mock('@/pages/FileSharing/utilities/printContent', () => ({
  default: vi.fn(),
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FileSharingPreviewFrame from './FileSharingPreviewFrame';

const baseFileEditorState = {
  isFilePreviewVisible: true,
  isFilePreviewDocked: true,
  currentlyEditingFile: mockCurrentlyEditingFile,
  setIsFilePreviewVisible: mockSetIsFilePreviewVisible,
  setIsFilePreviewDocked: mockSetIsFilePreviewDocked,
  setCurrentlyEditingFile: mockSetCurrentlyEditingFile,
  addFileToOpenInNewTab: mockAddFileToOpenInNewTab,
  error: null,
  filesToOpenInNewTab: [],
};

const addPreviewElement = () => {
  const el = document.createElement('div');
  el.id = 'file-preview';
  Object.defineProperty(el, 'getBoundingClientRect', {
    value: () => ({ x: 100, y: 100, width: 800, height: 600 }),
  });
  document.body.appendChild(el);
};

const removePreviewElement = () => {
  const el = document.getElementById('file-preview');
  if (el) el.remove();
};

describe('FileSharingPreviewFrame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentPathname = '/filesharing/share1';
    mockFileEditorStoreState = { ...baseFileEditorState };
    addPreviewElement();
  });

  afterEach(() => {
    removePreviewElement();
  });

  it('returns null when isFilePreviewVisible is false', () => {
    mockFileEditorStoreState = { ...baseFileEditorState, isFilePreviewVisible: false };

    const { container } = render(<FileSharingPreviewFrame />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when currentlyEditingFile is null', () => {
    mockFileEditorStoreState = { ...baseFileEditorState, currentlyEditingFile: null };

    const { container } = render(<FileSharingPreviewFrame />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when the file-preview DOM element is absent', () => {
    removePreviewElement();

    const { container } = render(<FileSharingPreviewFrame />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when navigated away from filesharing and preview is docked', () => {
    mockCurrentPathname = '/dashboard';
    mockFileEditorStoreState = { ...baseFileEditorState, isFilePreviewDocked: true };

    const { container } = render(<FileSharingPreviewFrame />);
    expect(container.innerHTML).toBe('');
  });

  it('renders ResizableWindow when all conditions are met', async () => {
    render(<FileSharingPreviewFrame />);

    await waitFor(() => {
      expect(screen.getByTestId('resizable-window')).toBeInTheDocument();
    });
  });

  it('renders FileRenderer inside ResizableWindow when all conditions are met', async () => {
    render(<FileSharingPreviewFrame />);

    await waitFor(() => {
      expect(screen.getByTestId('file-renderer')).toBeInTheDocument();
    });
  });

  it('renders UnsavedChangesDialog when all conditions are met', async () => {
    render(<FileSharingPreviewFrame />);

    await waitFor(() => {
      expect(screen.getByTestId('unsaved-dialog')).toBeInTheDocument();
    });
  });

  it('remains visible when on the filesharing page and preview is undocked', async () => {
    mockFileEditorStoreState = { ...baseFileEditorState, isFilePreviewDocked: false };

    render(<FileSharingPreviewFrame />);

    await waitFor(() => {
      expect(screen.getByTestId('resizable-window')).toBeInTheDocument();
    });
  });
});
