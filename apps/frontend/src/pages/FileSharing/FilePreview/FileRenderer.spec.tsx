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

const mockSetFileIsCurrentlyDisabled = vi.fn();
const mockFetchFileContent = vi.fn();
const mockResetContentPreview = vi.fn();
const mockSetOriginalContent = vi.fn();
const mockSetEditedContent = vi.fn();

let mockDownloadStoreState: any = {};
let mockFileEditorStoreState: any = {};
let mockFileContentPreviewStoreState: any = {};
let mockFileEditorContentStoreState: any = {};

vi.mock('@/pages/FileSharing/useFileSharingDownloadStore', () => ({
  default: () => mockDownloadStoreState,
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore', () => ({
  default: () => mockFileEditorStoreState,
}));

vi.mock('@/pages/FileSharing/useFileSharingStore', () => ({
  default: () => ({
    setFileIsCurrentlyDisabled: mockSetFileIsCurrentlyDisabled,
  }),
}));

vi.mock('@/pages/FileSharing/FilePreview/useFileContentPreviewStore', () => ({
  default: () => mockFileContentPreviewStoreState,
}));

vi.mock('@/pages/FileSharing/FilePreview/useFileEditorContentStore', () => ({
  default: () => mockFileEditorContentStoreState,
}));

vi.mock('@/hooks/useMedia', () => ({
  default: () => ({ isMobileView: false }),
}));

vi.mock('i18next', () => {
  const i18n = {
    t: (key: string) => key,
    use: () => i18n,
    init: () => i18n,
    language: 'en',
    changeLanguage: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  };
  return { default: i18n, ...i18n };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/filesharing/utils/getFileExtension', () => ({
  default: vi.fn((path: string) => {
    const parts = path.split('.');
    return parts[parts.length - 1];
  }),
}));

vi.mock('@libs/filesharing/utils/isPdfExtension', () => ({
  default: vi.fn((ext: string) => ext === 'pdf'),
}));

vi.mock('@libs/filesharing/utils/isImageExtension', () => ({
  default: vi.fn((ext: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)),
}));

vi.mock('@libs/filesharing/utils/isMediaExtension', () => ({
  default: vi.fn((ext: string) => ['mp4', 'mp3', 'webm', 'ogg'].includes(ext)),
}));

vi.mock('@libs/filesharing/utils/isTextExtension', () => ({
  default: vi.fn((ext: string) => ['txt', 'md', 'json', 'js'].includes(ext)),
}));

vi.mock('@libs/filesharing/utils/isDrawioExtension', () => ({
  default: vi.fn((ext: string) => ext === 'drawio'),
}));

vi.mock('@libs/filesharing/utils/isOfficeDocument', () => ({
  default: vi.fn(() => false),
}));

vi.mock('@libs/filesharing/utils/isVideoExtension', () => ({
  default: vi.fn((ext: string) => ['mp4', 'webm'].includes(ext)),
}));

vi.mock('@libs/filesharing/types/textExtensions', () => ({
  default: { MD: 'md', MARKDOWN: 'markdown' },
}));

vi.mock('@libs/filesharing/types/filePreviewType', () => ({
  FILE_PREVIEW_TYPE: {
    PDF: 'pdf',
    ONLY_OFFICE: 'onlyoffice',
    DRAWIO: 'drawio',
    IMAGE: 'image',
    MEDIA: 'media',
    TEXT: 'text',
    UNSUPPORTED: 'unsupported',
  },
}));

vi.mock('@libs/filesharing/constants/textPreviewElementId', () => ({
  default: 'text-preview-element',
}));

vi.mock('@/components/ui/ImageComponent', () => ({
  default: ({ downloadLink, altText }: any) => (
    <div
      data-testid="image-component"
      data-src={downloadLink}
    >
      {altText}
    </div>
  ),
}));

vi.mock('@/components/ui/MediaComponent', () => ({
  default: ({ url, isVideo }: any) => (
    <div
      data-testid="media-component"
      data-url={url}
      data-video={String(isVideo)}
    />
  ),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOffice', () => ({
  default: (props: any) => <div data-testid="onlyoffice-component" />,
}));

vi.mock('@/pages/FileSharing/FilePreview/Collabora/Collabora', () => ({
  default: (props: any) => <div data-testid="collabora-component" />,
}));

vi.mock('@/pages/FileSharing/FilePreview/DrawioViewer/DrawioViewer', () => ({
  default: (props: any) => <div data-testid="drawio-viewer" />,
}));

vi.mock('@/components/shared/PDFViewer/PdfViewer', () => ({
  default: ({ fetchUrl }: any) => (
    <div
      data-testid="pdf-viewer"
      data-url={fetchUrl}
    />
  ),
}));

vi.mock('@/components/ui/Renderer/TextPreview', () => ({
  default: ({ content }: any) => <div data-testid="text-preview">{content}</div>,
}));

vi.mock('@/components/ui/Renderer/MarkdownRenderer', () => ({
  default: ({ content }: any) => <div data-testid="markdown-renderer">{content}</div>,
}));

vi.mock('@/components/ui/Loading/CircleLoader', () => ({
  default: (props: any) => <div data-testid="circle-loader" />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import FileRenderer from './FileRenderer';

const createMockFile = (filename: string, filePath: string) => ({
  filename,
  filePath,
  basename: filename,
  etag: 'mock-etag',
  lastmod: '2025-01-01',
  size: 1024,
  type: 'file' as const,
  mime: '',
});

const baseDownloadStore = {
  temporaryDownloadUrl: '',
  publicDownloadLink: null,
  isEditorLoading: false,
  isCreatingBlobUrl: false,
  isFetchingPublicUrl: false,
  error: null,
};

const baseFileEditorContentStore = {
  editedContent: null,
  setEditedContent: mockSetEditedContent,
  setOriginalContent: mockSetOriginalContent,
};

const baseContentPreviewStore = {
  fileContent: null,
  isLoadingContent: false,
  fetchFileContent: mockFetchFileContent,
  reset: mockResetContentPreview,
};

describe('FileRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDownloadStoreState = { ...baseDownloadStore };
    mockFileEditorStoreState = { currentlyEditingFile: null };
    mockFileContentPreviewStoreState = { ...baseContentPreviewStore };
    mockFileEditorContentStoreState = { ...baseFileEditorContentStore };
  });

  it('returns null when no currently editing file', () => {
    mockFileEditorStoreState = { currentlyEditingFile: null };
    const { container } = render(<FileRenderer editMode={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders CircleLoader when loading', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('doc.pdf', '/docs/doc.pdf') };
    mockDownloadStoreState = { ...baseDownloadStore, isEditorLoading: true };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('renders unsupported message for unknown file types', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('file.xyz', '/docs/file.xyz') };
    mockDownloadStoreState = { ...baseDownloadStore, temporaryDownloadUrl: 'https://example.com/file.xyz' };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByText('filesharing.errors.FileFormatNotSupported')).toBeInTheDocument();
  });

  it('renders PdfViewer for PDF files', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('document.pdf', '/docs/document.pdf') };
    mockDownloadStoreState = { ...baseDownloadStore, temporaryDownloadUrl: 'https://example.com/document.pdf' };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
  });

  it('renders ImageComponent for image files', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('photo.png', '/images/photo.png') };
    mockDownloadStoreState = { ...baseDownloadStore, temporaryDownloadUrl: 'https://example.com/photo.png' };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('image-component')).toBeInTheDocument();
  });

  it('renders MediaComponent for media files', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('video.mp4', '/media/video.mp4') };
    mockDownloadStoreState = { ...baseDownloadStore, temporaryDownloadUrl: 'https://example.com/video.mp4' };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('media-component')).toBeInTheDocument();
  });

  it('renders CircleLoader for PDF when fileUrl is not ready', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('document.pdf', '/docs/document.pdf') };
    mockDownloadStoreState = { ...baseDownloadStore, temporaryDownloadUrl: '' };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('renders CircleLoader for image when isCreatingBlobUrl is true', () => {
    mockFileEditorStoreState = { currentlyEditingFile: createMockFile('photo.png', '/images/photo.png') };
    mockDownloadStoreState = {
      ...baseDownloadStore,
      isCreatingBlobUrl: true,
      temporaryDownloadUrl: 'https://example.com/photo.png',
    };

    render(<FileRenderer editMode={false} />);
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });
});
