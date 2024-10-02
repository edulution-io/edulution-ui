import { useMediaQuery } from 'usehooks-ts';

const useIsMobileView = () => useMediaQuery('(max-width: 767px)');
export default useIsMobileView;
