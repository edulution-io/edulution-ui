import { useMediaQuery } from 'usehooks-ts';

const useIsMobileView = () => useMediaQuery('(max-width: 768px)');
export default useIsMobileView;