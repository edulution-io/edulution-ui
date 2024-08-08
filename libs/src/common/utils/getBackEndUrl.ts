import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';

const getBackendEndUrl = (): string => getFrontEndUrl().replace('5173', '3001');
export default getBackendEndUrl;
