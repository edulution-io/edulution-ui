/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

interface PdfViewerProps {
  url?: string;
  fetchUrl?: string;
  fetchOptions?: RequestInit;
  containerClassName?: string;
  iframeClassName?: string;
  title?: string;
  sandbox?: string;
  loader?: React.ReactNode;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
}

const createPdfObjectUrl = async (response: Response): Promise<string> => {
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  }
  const contentType = (response.headers.get(HTTP_HEADERS.ContentType) || '').toLowerCase();

  if (contentType.includes('pdf')) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  const buffer = await response.arrayBuffer();
  const pdfBlob = new Blob([buffer], { type: RequestResponseContentType.APPLICATION_PDF });
  return URL.createObjectURL(pdfBlob);
};

const revokePrevUrl = (prev: string | null): null => {
  if (prev) URL.revokeObjectURL(prev);
  return null;
};

const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  fetchUrl,
  fetchOptions,
  containerClassName = 'w-full h-full',
  iframeClassName = 'w-full h-full border-0',
  title = 'PDF',
  sandbox,
  loader = <CircleLoader />,
  onError,
  style,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!fetchUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let didCancel = false;

    if (fetchUrl) {
      setIsLoading(true);
      setErrorMessage(null);
      setBlobUrl((prev) => revokePrevUrl(prev));

      void (async () => {
        try {
          const response = await fetch(fetchUrl, {
            method: HttpMethods.GET,
            signal: controller.signal,
            ...fetchOptions,
          });

          const objectUrl = await createPdfObjectUrl(response);
          if (didCancel) return;
          setBlobUrl(objectUrl);
        } catch (err) {
          if (didCancel) return;
          const error = err instanceof Error ? err : new Error(String(err));
          setErrorMessage(error.message || 'Failed to load PDF');
          onError?.(error);
        } finally {
          if (!didCancel) setIsLoading(false);
        }
      })();
    } else {
      setBlobUrl((prev) => revokePrevUrl(prev));
      setIsLoading(false);
      setErrorMessage(null);
    }

    return () => {
      didCancel = true;
      controller.abort();
      setBlobUrl((prev) => revokePrevUrl(prev));
    };
  }, [fetchUrl, fetchOptions, onError]);

  const iframeSource = useMemo(() => (fetchUrl ? (blobUrl ?? '') : (url ?? '')), [blobUrl, fetchUrl, url]);

  const canRender = Boolean(iframeSource) && !errorMessage;

  return (
    <div
      className={containerClassName}
      style={style}
      aria-busy={isLoading}
    >
      {isLoading && loader}

      {canRender && (
        <iframe
          key={iframeSource}
          src={iframeSource}
          title={title}
          className={`${iframeClassName} ${isLoading ? 'hidden' : 'block'}`}
          sandbox={sandbox}
        />
      )}

      {!isLoading && !canRender && (
        <div className="p-3 text-sm text-red-700">{errorMessage ?? 'Unable to display PDF'}</div>
      )}
    </div>
  );
};

export default PdfViewer;
