import VideoExtensions from '@libs/filesharing/types/videoExtensions';

const isVideoExtension = (extension: string | undefined): boolean =>
  Object.values(VideoExtensions).includes(extension as VideoExtensions);

export default isVideoExtension;
