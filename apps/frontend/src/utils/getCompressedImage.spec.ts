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

import getCompressedImage from './getCompressedImage';

describe('getCompressedImage', () => {
  const createMockFile = (type: string, name = 'test.png') => new File(['fake-content'], name, { type });

  it('rejects non-image files', async () => {
    const file = createMockFile('application/pdf', 'test.pdf');

    await expect(getCompressedImage(file, 100)).rejects.toThrow('usersettings.errors.notSupportedFileFormat');
  });

  it('resolves with base64 string for valid image within size limit', async () => {
    const smallBase64 = 'data:image/webp;base64,AAAA';

    const mockCtx = {
      drawImage: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue(smallBase64),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const file = createMockFile('image/png');

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/png;base64,test',
    };

    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as ProgressEvent<FileReader>);
        }
      }, 0);
      return mockFileReader as unknown as FileReader;
    });

    const mockImage = {
      onload: null as (() => void) | null,
      src: '',
      width: 200,
      height: 200,
    };

    vi.spyOn(globalThis, 'Image').mockImplementation(() => {
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);
      return mockImage as unknown as HTMLImageElement;
    });

    vi.useFakeTimers();

    const promise = getCompressedImage(file, 1000);
    vi.runAllTimers();

    const result = await promise;
    expect(result).toBe(smallBase64);

    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rejects when canvas context is null', async () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
      toDataURL: vi.fn(),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const file = createMockFile('image/png');

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      result: 'data:image/png;base64,test',
    };

    vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as ProgressEvent<FileReader>);
        }
      }, 0);
      return mockFileReader as unknown as FileReader;
    });

    const mockImage = {
      onload: null as (() => void) | null,
      src: '',
      width: 200,
      height: 200,
    };

    vi.spyOn(globalThis, 'Image').mockImplementation(() => {
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);
      return mockImage as unknown as HTMLImageElement;
    });

    vi.useFakeTimers();

    const promise = getCompressedImage(file, 1000);
    vi.runAllTimers();

    await expect(promise).rejects.toThrow('usersettings.errors.notSupportedFileFormat');

    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
