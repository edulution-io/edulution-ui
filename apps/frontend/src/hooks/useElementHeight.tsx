import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useElementsTotalHeight = (elementIds: string[], trigger?: any) => {
  const [totalHeight, setTotalHeight] = useState(0);

  useEffect(() => {
    const updateTotalHeight = () => {
      const combinedHeight = elementIds.reduce((acc, elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
          const styles = window.getComputedStyle(element);
          const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
          const height = element.offsetHeight + margin;
          return acc + height;
        }
        return acc;
      }, 0);
      setTotalHeight(combinedHeight);
    };

    updateTotalHeight();
    window.addEventListener('resize', updateTotalHeight);

    return () => {
      window.removeEventListener('resize', updateTotalHeight);
    };
  }, [elementIds, trigger]);

  return totalHeight;
};

export default useElementsTotalHeight;
