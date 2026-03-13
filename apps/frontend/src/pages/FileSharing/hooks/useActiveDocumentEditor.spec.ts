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

import { renderHook } from '@testing-library/react';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { ACTIVE_DOCUMENT_EDITOR } from '@libs/filesharing/constants/activeDocumentEditor';
import useActiveDocumentEditor from './useActiveDocumentEditor';

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: vi.fn((selector) => selector({ appConfigs: [] })),
}));

vi.mock('@libs/appconfig/utils/getExtendedOptionsValue', () => ({
  default: vi.fn(),
}));

vi.mock('@libs/appconfig/constants/extendedOptionKeys', () => ({
  default: {
    ONLY_OFFICE_URL: 'onlyOfficeUrl',
    COLLABORA_URL: 'collaboraUrl',
    ACTIVE_DOCUMENT_EDITOR: 'activeDocumentEditor',
  },
}));

vi.mock('@libs/appconfig/constants/apps', () => ({
  default: { FILE_SHARING: 'filesharing' },
}));

const mockGetExtendedOptionsValue = vi.mocked(getExtendedOptionsValue);

const setupMockConfig = (options: { onlyOfficeUrl?: string; collaboraUrl?: string; activeEditor?: string }) => {
  mockGetExtendedOptionsValue.mockImplementation((_configs, _app, key) => {
    if (key === ExtendedOptionKeys.ONLY_OFFICE_URL) return options.onlyOfficeUrl ?? '';
    if (key === ExtendedOptionKeys.COLLABORA_URL) return options.collaboraUrl ?? '';
    if (key === ExtendedOptionKeys.ACTIVE_DOCUMENT_EDITOR) return options.activeEditor ?? undefined;
    return undefined;
  });
};

describe('useActiveDocumentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to OnlyOffice when both are configured and no preference set', () => {
    setupMockConfig({
      onlyOfficeUrl: 'https://onlyoffice.example.com',
      collaboraUrl: 'https://collabora.example.com',
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isOnlyOfficeActive).toBe(true);
    expect(result.current.isCollaboraActive).toBe(false);
    expect(result.current.isDocumentServerConfigured).toBe(true);
    expect(result.current.isCollaboraServerConfigured).toBe(true);
  });

  it('activates Collabora when preference is set to collabora', () => {
    setupMockConfig({
      onlyOfficeUrl: 'https://onlyoffice.example.com',
      collaboraUrl: 'https://collabora.example.com',
      activeEditor: ACTIVE_DOCUMENT_EDITOR.COLLABORA,
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isCollaboraActive).toBe(true);
    expect(result.current.isOnlyOfficeActive).toBe(false);
  });

  it('activates OnlyOffice when preference is set to onlyoffice', () => {
    setupMockConfig({
      onlyOfficeUrl: 'https://onlyoffice.example.com',
      collaboraUrl: 'https://collabora.example.com',
      activeEditor: ACTIVE_DOCUMENT_EDITOR.ONLY_OFFICE,
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isOnlyOfficeActive).toBe(true);
    expect(result.current.isCollaboraActive).toBe(false);
  });

  it('returns both inactive when neither is configured', () => {
    setupMockConfig({});

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isOnlyOfficeActive).toBe(false);
    expect(result.current.isCollaboraActive).toBe(false);
    expect(result.current.isDocumentServerConfigured).toBe(false);
    expect(result.current.isCollaboraServerConfigured).toBe(false);
  });

  it('falls back to OnlyOffice when only OnlyOffice is configured but preference is Collabora', () => {
    setupMockConfig({
      onlyOfficeUrl: 'https://onlyoffice.example.com',
      activeEditor: ACTIVE_DOCUMENT_EDITOR.COLLABORA,
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isCollaboraActive).toBe(false);
    expect(result.current.isCollaboraServerConfigured).toBe(false);
    expect(result.current.isOnlyOfficeActive).toBe(true);
  });

  it('falls back to Collabora when only Collabora is configured but preference is OnlyOffice', () => {
    setupMockConfig({
      collaboraUrl: 'https://collabora.example.com',
      activeEditor: ACTIVE_DOCUMENT_EDITOR.ONLY_OFFICE,
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isOnlyOfficeActive).toBe(false);
    expect(result.current.isCollaboraActive).toBe(true);
    expect(result.current.isCollaboraServerConfigured).toBe(true);
    expect(result.current.isDocumentServerConfigured).toBe(false);
  });

  it('returns OnlyOffice inactive when URL is not configured', () => {
    setupMockConfig({
      collaboraUrl: 'https://collabora.example.com',
      activeEditor: ACTIVE_DOCUMENT_EDITOR.COLLABORA,
    });

    const { result } = renderHook(() => useActiveDocumentEditor());

    expect(result.current.isOnlyOfficeActive).toBe(false);
    expect(result.current.isDocumentServerConfigured).toBe(false);
    expect(result.current.isCollaboraActive).toBe(true);
  });
});
