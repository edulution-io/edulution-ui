import ImageExtensions from '@libs/filesharing/types/imageExtensions';

const isImageExtension = (extension: string | undefined): boolean =>
  Object.values(ImageExtensions).includes(extension as ImageExtensions);

export default isImageExtension;
