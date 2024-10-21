import { useEffect, useState } from 'react';

const useScroll = (elementRef: React.RefObject<HTMLElement>) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        setIsScrolled(elementRef.current.scrollTop > 0);
      }
    };

    const currentElement = elementRef.current;

    if (currentElement) {
      currentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [elementRef]);

  return isScrolled;
};

export default useScroll;
