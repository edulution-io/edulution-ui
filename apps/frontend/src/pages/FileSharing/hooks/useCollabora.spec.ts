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

const { mockFetchEditorPath, mockFetchWopiToken, mockReset, mockUseParams } = vi.hoisted(() => ({
  mockFetchEditorPath: vi.fn(),
  mockFetchWopiToken: vi.fn(),
  mockReset: vi.fn(),
  mockUseParams: vi.fn().mockReturnValue({ webdavShare: 'params-share' }),
}));

vi.mock('react-router-dom', () => ({
  useParams: mockUseParams,
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: vi.fn((selector) => selector({ appConfigs: [] })),
}));

vi.mock('@libs/appconfig/utils/getExtendedOptionsValue', () => ({
  default: vi.fn().mockReturnValue('https://collabora.example.com'),
}));

vi.mock('@libs/appconfig/constants/extendedOptionKeys', () => ({
  default: { COLLABORA_URL: 'collaboraUrl' },
}));

vi.mock('@libs/appconfig/constants/apps', () => ({
  default: { FILE_SHARING: 'filesharing' },
}));

vi.mock('@libs/common/utils/URL/getFrontEndUrl', () => ({
  default: vi.fn().mockReturnValue('https://app.example.com'),
}));

vi.mock('@libs/common/constants/eduApiRoot', () => ({
  default: 'edu-api',
}));

vi.mock('@libs/filesharing/constants/wopi', () => ({
  WOPI_BASE_PATH: 'wopi/files',
}));

vi.mock('@libs/common/utils/getBase64String', () => ({
  encodeBase64: vi.fn().mockReturnValue('L2RvY3MvdGVzdC5kb2N4'),
}));

vi.mock('@/pages/FileSharing/FilePreview/Collabora/useCollaboraStore', () => ({
  default: vi.fn().mockReturnValue({
    accessToken: 'mock-token',
    accessTokenTTL: 86400000,
    editorPath: '/browser/abc/cool.html',
    isLoading: false,
    fetchEditorPath: mockFetchEditorPath,
    fetchWopiToken: mockFetchWopiToken,
    reset: mockReset,
  }),
}));

import { renderHook } from '@testing-library/react';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import useCollabora from './useCollabora';

describe('useCollabora', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns collaboraUrl from app config', () => {
    const { result } = renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(result.current.collaboraUrl).toBe('https://collabora.example.com');
  });

  it('constructs wopiSrc with base64 encoded fileId', () => {
    const { result } = renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(result.current.wopiSrc).toContain('https://app.example.com/edu-api/wopi/files/');
  });

  it('replaces special characters in fileId', () => {
    const { result } = renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    const fileId = result.current.wopiSrc.split('wopi/files/')[1];
    expect(fileId).not.toMatch(/[/+=]/);
  });

  it('fetches editor path on mount when collaboraUrl is set', () => {
    renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(mockFetchEditorPath).toHaveBeenCalledWith('https://collabora.example.com');
  });

  it('does not fetch editor path when collaboraUrl is empty', () => {
    vi.mocked(getExtendedOptionsValue).mockReturnValue('');

    renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(mockFetchEditorPath).not.toHaveBeenCalled();
  });

  it('fetches WOPI token with filePath and webdavShare from params', () => {
    renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(mockReset).toHaveBeenCalled();
    expect(mockFetchWopiToken).toHaveBeenCalledWith('/docs/test.docx', 'params-share');
  });

  it('uses webdavShare prop over params when provided', () => {
    renderHook(() => useCollabora({ filePath: '/docs/test.docx', webdavShare: 'prop-share' }));

    expect(mockFetchWopiToken).toHaveBeenCalledWith('/docs/test.docx', 'prop-share');
  });

  it('returns store values', () => {
    const { result } = renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(result.current.accessToken).toBe('mock-token');
    expect(result.current.accessTokenTTL).toBe(86400000);
    expect(result.current.editorPath).toBe('/browser/abc/cool.html');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty collaboraUrl when not configured', () => {
    vi.mocked(getExtendedOptionsValue).mockReturnValue(undefined);

    const { result } = renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(result.current.collaboraUrl).toBe('');
  });

  it('does not fetch WOPI token when no webdavShare is available', () => {
    mockUseParams.mockReturnValue({});

    renderHook(() => useCollabora({ filePath: '/docs/test.docx' }));

    expect(mockReset).toHaveBeenCalled();
    expect(mockFetchWopiToken).not.toHaveBeenCalled();
  });
});
