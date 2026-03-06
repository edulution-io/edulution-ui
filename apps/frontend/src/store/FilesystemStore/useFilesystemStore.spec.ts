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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@libs/common/utils/convertImageFileToCompressedWebp', () => ({
  default: vi.fn((file: File) => Promise.resolve(file)),
}));
vi.mock('mime', () => ({
  default: { getExtension: vi.fn((type: string) => (type === 'image/png' ? 'png' : null)) },
}));

const mockObjectUrl = 'blob:http://localhost:3000/mock-uuid';
const originalCreateObjectURL = URL.createObjectURL;
URL.createObjectURL = vi.fn(() => mockObjectUrl);

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import eduApi from '@/api/eduApi';
import useFilesystemStore from './useFilesystemStore';

const initialStoreState = useFilesystemStore.getState();

afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
});

describe('useFilesystemStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useFilesystemStore.setState(initialStoreState, true);
  });

  describe('fetchImage', () => {
    it('returns content and source on success', async () => {
      const imageBlob = new Blob(['fake-image'], { type: 'image/png' });
      server.use(
        http.get(
          'http://localhost/test-image.png',
          () =>
            new HttpResponse(imageBlob, {
              headers: { 'x-asset-source': 'custom', 'Content-Type': 'image/png' },
            }),
        ),
      );

      const result = await useFilesystemStore.getState().fetchImage('http://localhost/test-image.png');

      expect(result).toEqual({ source: 'custom', content: mockObjectUrl });
      expect(useFilesystemStore.getState().fetchingImageVariant).toBeNull();
    });

    it('sets fetchingImageVariant when variant is provided', async () => {
      let variantDuringRequest: string | null = null;
      const imageBlob = new Blob(['fake-image'], { type: 'image/png' });
      server.use(
        http.get('http://localhost/test-image.png', () => {
          variantDuringRequest = useFilesystemStore.getState().fetchingImageVariant;
          return new HttpResponse(imageBlob, {
            headers: { 'x-asset-source': 'fallback', 'Content-Type': 'image/png' },
          });
        }),
      );

      await useFilesystemStore.getState().fetchImage('http://localhost/test-image.png', 'dark' as never);

      expect(variantDuringRequest).toBe('dark');
      expect(useFilesystemStore.getState().fetchingImageVariant).toBeNull();
    });

    it('returns source none with empty content on error', async () => {
      server.use(
        http.get('http://localhost/missing.png', () =>
          HttpResponse.json({ message: 'not.found', statusCode: 404 }, { status: 404 }),
        ),
      );

      const result = await useFilesystemStore.getState().fetchImage('http://localhost/missing.png');

      expect(result).toEqual({ source: 'none', content: '' });
    });

    it('defaults source to none when header is missing', async () => {
      const imageBlob = new Blob(['fake-image'], { type: 'image/png' });
      server.use(
        http.get(
          'http://localhost/no-header.png',
          () =>
            new HttpResponse(imageBlob, {
              headers: { 'Content-Type': 'image/png' },
            }),
        ),
      );

      const result = await useFilesystemStore.getState().fetchImage('http://localhost/no-header.png');

      expect(result?.source).toBe('none');
      expect(result?.content).toBe(mockObjectUrl);
    });
  });

  describe('deleteImageFile', () => {
    it('returns true on success', async () => {
      server.use(
        http.delete('/edu-api/files/public/assets/my-app/logo.webp', () => new HttpResponse(null, { status: 204 })),
      );

      const result = await useFilesystemStore.getState().deleteImageFile('my-app', 'logo.webp');

      expect(result).toBe(true);
    });

    it('returns false on failure', async () => {
      server.use(
        http.delete('/edu-api/files/public/assets/my-app/logo.webp', () =>
          HttpResponse.json({ message: 'delete.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useFilesystemStore.getState().deleteImageFile('my-app', 'logo.webp');

      expect(result).toBe(false);
    });
  });

  describe('uploadImageFile', () => {
    it('returns true on success with a File', async () => {
      vi.spyOn(eduApi, 'post').mockResolvedValueOnce({ data: undefined, status: 201 } as never);

      const file = new File(['content'], 'logo.png', { type: 'image/png' });
      const result = await useFilesystemStore.getState().uploadImageFile('/uploads', 'logo.webp', file, 'my-app');

      expect(result).toBe(true);
      expect(eduApi.post).toHaveBeenCalledWith('files/my-app', expect.any(FormData));
      expect(useFilesystemStore.getState().uploadingKey).toBeNull();
    });

    it('returns true on success with a Blob', async () => {
      vi.spyOn(eduApi, 'post').mockResolvedValueOnce({ data: undefined, status: 201 } as never);

      const blob = new Blob(['content'], { type: 'image/png' });
      const result = await useFilesystemStore.getState().uploadImageFile('/uploads', 'logo', blob, 'my-app');

      expect(result).toBe(true);
      expect(eduApi.post).toHaveBeenCalledWith('files/my-app', expect.any(FormData));
    });

    it('uses base endpoint when appName is not provided', async () => {
      vi.spyOn(eduApi, 'post').mockResolvedValueOnce({ data: undefined, status: 201 } as never);

      const file = new File(['content'], 'logo.png', { type: 'image/png' });
      const result = await useFilesystemStore.getState().uploadImageFile('/uploads', 'logo.webp', file);

      expect(result).toBe(true);
      expect(eduApi.post).toHaveBeenCalledWith('files', expect.any(FormData));
    });

    it('sets uploadingKey during upload', async () => {
      vi.spyOn(eduApi, 'post').mockImplementationOnce(() => {
        expect(useFilesystemStore.getState().uploadingKey).toBe('upload-key-1');
        return { data: undefined, status: 201 } as never;
      });

      const file = new File(['content'], 'logo.png', { type: 'image/png' });
      await useFilesystemStore.getState().uploadImageFile('/uploads', 'logo.webp', file, 'my-app', 'upload-key-1');

      expect(useFilesystemStore.getState().uploadingKey).toBeNull();
    });

    it('returns false on failure', async () => {
      vi.spyOn(eduApi, 'post').mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'upload.error', statusCode: 500 }, status: 500 },
      });

      const file = new File(['content'], 'logo.png', { type: 'image/png' });
      const result = await useFilesystemStore.getState().uploadImageFile('/uploads', 'logo.webp', file, 'my-app');

      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', () => {
      useFilesystemStore.setState({
        uploadingKey: 'some-key',
        error: new Error('test'),
        fetchingImageVariant: 'dark' as never,
      });

      useFilesystemStore.getState().reset();

      const state = useFilesystemStore.getState();
      expect(state.fetchingImageVariant).toBeNull();
      expect(state.uploadingKey).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
