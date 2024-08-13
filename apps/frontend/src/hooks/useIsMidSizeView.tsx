import { useMediaQuery } from 'usehooks-ts';

const useIsMidSizeView = () => useMediaQuery('(min-width: 768px) and (max-width: 1550px)');
export default useIsMidSizeView;
