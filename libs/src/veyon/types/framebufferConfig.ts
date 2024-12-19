// This type is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

type FrameBufferConfig = {
  format: 'jpeg' | 'png';
  compression: number;
  quality: number;
  width?: number;
  height?: number;
};

export default FrameBufferConfig;
