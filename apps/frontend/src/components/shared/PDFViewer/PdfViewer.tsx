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

import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const PdfViewer = ({
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
}: PdfViewerProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!fetchUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const revokeObjectUrlCallback = useRef<null | (() => void)>(null);

  useEffect(() => {
    let isCanceled = false;
    const controller = new AbortController();

    const loadPdf = async () => {
      if (!fetchUrl) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(fetchUrl, { method: HttpMethods.GET, signal: controller.signal, ...fetchOptions });
        const contentType = response.headers.get(HTTP_HEADERS.ContentType) || '';
        let objectUrl: string;

        if (contentType.toLowerCase().includes('pdf')) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
        } else {
          const buffer = await response.arrayBuffer();
          const pdfBlob = new Blob([buffer], { type: RequestResponseContentType.APPLICATION_PDF });
          objectUrl = URL.createObjectURL(pdfBlob);
        }

        if (isCanceled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setBlobUrl(objectUrl);
        revokeObjectUrlCallback.current = () => URL.revokeObjectURL(objectUrl);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
      } finally {
        if (!isCanceled) setIsLoading(false);
      }
    };

    void loadPdf();

    return () => {
      isCanceled = true;
      controller.abort();
      if (revokeObjectUrlCallback.current) {
        revokeObjectUrlCallback.current();
        revokeObjectUrlCallback.current = null;
      }
    };
  }, [fetchUrl, fetchOptions, onError]);

  const iframeSource = useMemo(() => {
    if (fetchUrl) return blobUrl || '';
    if (!url) return '';
    return url;
  }, [blobUrl, fetchUrl, url]);

  const canRender = !!iframeSource && !errorMessage;

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

      {!isLoading && !canRender && <div className="p-3 text-sm text-red-700">{errorMessage}</div>}
    </div>
  );
};

export default PdfViewer;
