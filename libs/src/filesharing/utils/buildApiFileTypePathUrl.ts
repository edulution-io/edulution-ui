import ContentType from '@libs/filesharing/types/contentType';

const buildApiFileTypePathUrl = (base: string, type: ContentType, path: string): string =>
  `${base}?type=${type}&path=${path}`;

export default buildApiFileTypePathUrl;
