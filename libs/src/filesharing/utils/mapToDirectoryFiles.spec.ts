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

vi.mock('@libs/filesharing/utils/parseWebDAVMultiStatus', () => ({
  default: vi.fn(),
}));

vi.mock('./parseWebDAVResponse', () => ({
  default: vi.fn(),
}));

import mapToDirectoryFiles from './mapToDirectoryFiles';
import parseWebDAVMultiStatus from '@libs/filesharing/utils/parseWebDAVMultiStatus';
import parseWebDAVResponse from './parseWebDAVResponse';

const mockedParseMultiStatus = vi.mocked(parseWebDAVMultiStatus);
const mockedParseResponse = vi.mocked(parseWebDAVResponse);

describe('mapToDirectoryFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed files when XML contains valid responses', () => {
    const mockResponse1 = { href: '/file1.txt' };
    const mockResponse2 = { href: '/file2.txt' };
    const mockFile1 = { filename: 'file1.txt', filePath: '/file1.txt' };
    const mockFile2 = { filename: 'file2.txt', filePath: '/file2.txt' };

    mockedParseMultiStatus.mockReturnValue([mockResponse1, mockResponse2] as never);
    mockedParseResponse.mockReturnValueOnce(mockFile1 as never).mockReturnValueOnce(mockFile2 as never);

    const result = mapToDirectoryFiles('<xml>data</xml>');

    expect(mockedParseMultiStatus).toHaveBeenCalledWith('<xml>data</xml>');
    expect(mockedParseResponse).toHaveBeenCalledTimes(2);
    expect(result).toEqual([mockFile1, mockFile2]);
  });

  it('filters out entries with empty filenames', () => {
    const mockResponse1 = { href: '/file1.txt' };
    const mockResponse2 = { href: '/' };
    const mockFile1 = { filename: 'file1.txt', filePath: '/file1.txt' };
    const mockFileEmpty = { filename: '', filePath: '/' };

    mockedParseMultiStatus.mockReturnValue([mockResponse1, mockResponse2] as never);
    mockedParseResponse.mockReturnValueOnce(mockFile1 as never).mockReturnValueOnce(mockFileEmpty as never);

    const result = mapToDirectoryFiles('<xml>data</xml>');

    expect(result).toEqual([mockFile1]);
  });

  it('returns empty array for empty XML', () => {
    mockedParseMultiStatus.mockReturnValue([]);

    const result = mapToDirectoryFiles('');

    expect(result).toEqual([]);
  });

  it('filters out falsy entries', () => {
    const mockResponse1 = { href: '/file1.txt' };
    const mockFile1 = { filename: 'file1.txt', filePath: '/file1.txt' };

    mockedParseMultiStatus.mockReturnValue([mockResponse1, mockResponse1] as never);
    mockedParseResponse.mockReturnValueOnce(mockFile1 as never).mockReturnValueOnce(null as never);

    const result = mapToDirectoryFiles('<xml>data</xml>');

    expect(result).toEqual([mockFile1]);
  });
});
