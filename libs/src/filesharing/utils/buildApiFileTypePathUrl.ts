import ContentType from '@libs/filesharing/ContentType';

const buildApiFileTypePathUrl = (base: string, type: ContentType, path: string): string =>
  `${base}?type=${type}&path=${path}`;

export default buildApiFileTypePathUrl;
