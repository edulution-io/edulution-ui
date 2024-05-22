import { useMediaQuery } from 'usehooks-ts';

const useIsMobileView = () => {
  return useMediaQuery('(max-width: 768px)');
};
export default useIsMobileView;
