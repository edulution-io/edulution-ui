import { mapToDirectories, mapToDirectoryFiles } from './filesharing.utilities';

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
