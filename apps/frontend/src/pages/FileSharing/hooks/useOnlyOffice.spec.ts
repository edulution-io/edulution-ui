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

const mockGetOnlyOfficeJwtToken = vi.fn().mockResolvedValue('mock-jwt-token');

vi.mock('react-router-dom', () => ({
  useParams: () => ({ webdavShare: 'params-share' }),
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: () => ({
    eduApiToken: 'mock-edu-api-token',
    user: { username: 'testuser' },
  }),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore', () => ({
  default: () => ({
    getOnlyOfficeJwtToken: mockGetOnlyOfficeJwtToken,
  }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));

vi.mock('@/store/useThemeStore', () => ({
  default: () => ({
    theme: 'light',
    getResolvedTheme: () => 'light',
  }),
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: () => ({
    appConfigs: [{ name: 'filesharing', options: {} }],
  }),
}));

vi.mock('@libs/appconfig/utils/getExtendedOptionsValue', () => ({
  default: vi.fn().mockReturnValue('https://onlyoffice.example.com'),
}));

vi.mock('@libs/filesharing/utils/getFileExtension', () => ({
  default: vi.fn().mockReturnValue('docx'),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/utilities/findDocumentsEditorType', () => ({
  default: vi.fn().mockReturnValue({ id: 'docxEditor', key: 'docx-key-1', documentType: 'word' }),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/utilities/getCallbackBaseUrl', () => ({
  default: vi.fn().mockReturnValue('https://example.com/callback'),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/utilities/generateOnlyOfficeConfig', () => ({
  default: vi.fn().mockReturnValue({
    document: { fileType: 'docx', key: 'docx-key-1', title: 'test.docx', url: 'https://example.com/file.docx' },
    documentType: 'word',
    type: 'desktop',
    token: '',
  }),
}));

vi.mock('@libs/appconfig/constants/extendedOptionKeys', () => ({
  default: { ONLY_OFFICE_URL: 'onlyOfficeUrl' },
}));

vi.mock('@libs/appconfig/constants/apps', () => ({
  default: { FILE_SHARING: 'filesharing' },
}));

vi.mock('@libs/common/constants/theme', () => ({
  default: { dark: 'dark', light: 'light' },
}));

import { renderHook, waitFor } from '@testing-library/react';
import useOnlyOffice from './useOnlyOffice';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import findDocumentsEditorType from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/findDocumentsEditorType';
import getCallbackBaseUrl from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/getCallbackBaseUrl';
import generateOnlyOfficeConfig from '@/pages/FileSharing/FilePreview/OnlyOffice/utilities/generateOnlyOfficeConfig';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';

describe('useOnlyOffice', () => {
  const defaultProps = {
    filePath: '/documents/test.docx',
    fileName: 'test.docx',
    url: 'https://example.com/file.docx',
    type: 'desktop' as const,
    mode: 'edit' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOnlyOfficeJwtToken.mockResolvedValue('mock-jwt-token');
  });

  it('returns documentServerURL from appConfigs', () => {
    const { result } = renderHook(() => useOnlyOffice(defaultProps));

    expect(getExtendedOptionsValue).toHaveBeenCalled();
    expect(result.current.documentServerURL).toBe('https://onlyoffice.example.com');
  });

  it('returns editorType based on file extension', () => {
    const { result } = renderHook(() => useOnlyOffice(defaultProps));

    expect(getFileExtension).toHaveBeenCalledWith('test.docx');
    expect(findDocumentsEditorType).toHaveBeenCalledWith('docx');
    expect(result.current.editorType).toEqual({ id: 'docxEditor', key: 'docx-key-1', documentType: 'word' });
  });

  it('generates config and sets editorConfig after mount', async () => {
    const { result } = renderHook(() => useOnlyOffice(defaultProps));

    await waitFor(() => {
      expect(result.current.editorConfig).not.toBeNull();
    });

    expect(generateOnlyOfficeConfig).toHaveBeenCalled();
    expect(mockGetOnlyOfficeJwtToken).toHaveBeenCalled();
    expect(result.current.editorConfig?.token).toBe('mock-jwt-token');
  });

  it('uses webdavShare prop over params when provided', () => {
    renderHook(() => useOnlyOffice({ ...defaultProps, webdavShare: 'prop-share' }));

    expect(getCallbackBaseUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        share: 'prop-share',
      }),
    );
  });

  it('uses webdavShare from params when prop is not provided', () => {
    renderHook(() => useOnlyOffice(defaultProps));

    expect(getCallbackBaseUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        share: 'params-share',
      }),
    );
  });
});
