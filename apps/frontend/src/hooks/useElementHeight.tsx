/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useElementHeight = (elementIds: string[], trigger?: any) => {
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

export default useElementHeight;
