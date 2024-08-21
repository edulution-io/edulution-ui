import { mapToDirectories, mapToDirectoryFiles, transformWebdavResponse } from './filesharing.utilities';
import { WebdavStatusReplay } from './filesharing.types';

const sampleXML = `
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/path/to/file1</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getetag>etag1</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
  <d:response>
    <d:href>/path/to/folder1/</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>Folder 1</d:displayname>
        <d:getetag>etag2</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:resourcetype>
          <d:collection></d:collection>
        </d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
`;

const sampleXMLWithEtag = `
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/path/to/file1</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
  <d:response>
    <d:href>/path/to/folder1/</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>Folder 1</d:displayname>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:resourcetype>
          <d:collection></d:collection>
        </d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
`;

const sampleXMLWithSinglePropstat = `
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/path/to/file1</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getetag>etag1</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
`;

const sampleXMLWithInvalidPropstat = `
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/path/to/file1</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getetag>etag1</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 404 Not Found</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
`;

const sampleXMLWithMultiplePropstat = `
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/path/to/file1</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getetag>etag1</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
    <d:propstat>
      <d:prop>
        <d:displayname>File 1</d:displayname>
        <d:getetag>etag1</d:getetag>
        <d:getlastmodified>Mon, 01 Jan 2023 00:00:00 GMT</d:getlastmodified>
        <d:getcontentlength>1234</d:getcontentlength>
        <d:resourcetype></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 404 Not Found</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
`;

jest.mock('@nestjs/common', () => ({
  Logger: {
    error: jest.fn(),
  },
}));

describe('webdav.utils', () => {
  describe('mapToDirectoryFiles', () => {
    it('should map XML data to DirectoryFile objects', () => {
      const result = mapToDirectoryFiles(sampleXML);
      expect(result).toEqual([
        {
          basename: 'File 1',
          etag: 'etag1',
          filename: '/path/to/file1',
          lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
          size: 1234,
          type: 'FILE',
        },
        {
          basename: 'Folder 1',
          etag: 'etag2',
          filename: '/path/to/folder1/',
          lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
          size: undefined,
          type: 'COLLECTION',
        },
      ]);
    });

    it('should log an error and return an empty array if XML parsing fails', () => {
      const invalidXML = '<invalid>';
      const result = mapToDirectoryFiles(invalidXML);
      expect(result).toEqual([]);
    });

    describe('mapToDirectoryFiles', () => {
      it('should map XML data to DirectoryFile objects etag', () => {
        const result = mapToDirectoryFiles(sampleXMLWithEtag);
        expect(result).toEqual([
          {
            basename: 'File 1',
            filename: '/path/to/file1',
            lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
            size: 1234,
            etag: '',
            type: 'FILE',
          },
          {
            basename: 'Folder 1',
            filename: '/path/to/folder1/',
            lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
            size: undefined,
            etag: '',
            type: 'COLLECTION',
          },
        ]);
      });

      it('should map XML data to DirectoryFile objects with single propstat', () => {
        const result = mapToDirectoryFiles(sampleXMLWithSinglePropstat);
        expect(result).toEqual([
          {
            basename: 'File 1',
            etag: 'etag1',
            filename: '/path/to/file1',
            lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
            size: 1234,
            type: 'FILE',
          },
        ]);
      });

      it('should return an empty array for invalid propstat entries', () => {
        const result = mapToDirectoryFiles(sampleXMLWithInvalidPropstat);
        expect(result).toEqual([{}]);
      });

      it('should handle multiple propstat entries and only use the valid one', () => {
        const result = mapToDirectoryFiles(sampleXMLWithMultiplePropstat);
        expect(result).toEqual([
          {
            basename: 'File 1',
            etag: 'etag1',
            filename: '/path/to/file1',
            lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
            size: 1234,
            type: 'FILE',
          },
        ]);
      });

      it('should return an empty array for empty XML data', () => {
        const emptyXML = '';
        const result = mapToDirectoryFiles(emptyXML);
        expect(result).toEqual([]);
      });

      it('should return an empty array for XML data missing d:response', () => {
        const invalidXML = '<d:multistatus xmlns:d="DAV:"></d:multistatus>';
        const result = mapToDirectoryFiles(invalidXML);
        expect(result).toEqual([]);
      });
    });

    describe('mapToDirectories', () => {
      it('should map XML data to DirectoryFile objects representing directories', () => {
        const result = mapToDirectories(sampleXML);
        expect(result).toEqual([
          {
            basename: 'Folder 1',
            etag: 'etag2',
            filename: '/path/to/folder1/',
            lastmod: 'Mon, 01 Jan 2023 00:00:00 GMT',
            size: undefined,
            type: 'COLLECTION',
          },
        ]);
      });

      it('should map XML data to DirectoryFile objects representing directories with single propstat', () => {
        const result = mapToDirectories(sampleXMLWithSinglePropstat);
        expect(result).toEqual([]);
      });

      it('should return an empty array for invalid propstat entries', () => {
        const result = mapToDirectories(sampleXMLWithInvalidPropstat);
        expect(result).toEqual([]);
      });

      it('should handle multiple propstat entries and only use the valid one', () => {
        const result = mapToDirectories(sampleXMLWithMultiplePropstat);
        expect(result).toEqual([]);
      });

      it('should return an empty array for empty XML data', () => {
        const emptyXML = '';
        const result = mapToDirectories(emptyXML);
        expect(result).toEqual([]);
      });

      it('should return an empty array for XML data missing d:response', () => {
        const invalidXML = '<d:multistatus xmlns:d="DAV:"></d:multistatus>';
        const result = mapToDirectories(invalidXML);
        expect(result).toEqual([]);
      });
    });
  });

  describe('transformWebdavResponse', () => {
    it('should return success true for status code 200', () => {
      const response: WebdavStatusReplay = { status: 200, success: false };
      const result = transformWebdavResponse(response);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('should return success true for status code 299', () => {
      const response: WebdavStatusReplay = { status: 299, success: false };
      const result = transformWebdavResponse(response);
      expect(result).toEqual({ status: 299, success: true });
    });

    it('should return success false for status code 300', () => {
      const response: WebdavStatusReplay = { status: 300, success: true };
      const result = transformWebdavResponse(response);
      expect(result).toEqual({ status: 300, success: false });
    });

    it('should return success false for status code 199', () => {
      const response: WebdavStatusReplay = { status: 199, success: true };
      const result = transformWebdavResponse(response);
      expect(result).toEqual({ status: 199, success: false });
    });
  });
});
