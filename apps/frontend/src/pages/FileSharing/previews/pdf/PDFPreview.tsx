import React, { FC, useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DirectoryFile } from '@/datatypes/filesystem';
import { getFileNameFromPath } from '@/pages/FileSharing/utilities/fileManagerCommon';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFPreviewProps {
  file: DirectoryFile;
}

const PDFPreview: FC<PDFPreviewProps> = ({ file }) => {
  const mediaUrl = `${window.location.origin}/webdav/${file.filename}`;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  const onDocumentLoadSuccess = (document: PDFDocumentProxy) => {
    setNumPages(document.numPages);
  };

  const goToPrevPage = () => setCurrentPage((current) => Math.max(current - 1, 1));
  const goToNextPage = () => setCurrentPage((current) => Math.min(current + 1, numPages ?? current));

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setContainerWidth(entry.contentRect.width);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="pdf-preview">
      <header className="pb-4 pt-4">
        <h1>PDF Preview: {getFileNameFromPath(file.filename)}</h1>
      </header>
      <div
        className="pdf-container"
        ref={containerRef}
      >
        <nav className="pdf-navigation">
          <div className="flex  justify-between  rounded-lg bg-gray-200 p-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= (numPages ?? currentPage)}
              type="button"
            >
              Next
            </button>
          </div>
        </nav>
        <Document
          file={mediaUrl}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFPreview;
