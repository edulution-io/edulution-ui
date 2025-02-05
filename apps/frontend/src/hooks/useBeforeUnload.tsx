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

import { useEffect } from 'react';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

const useBeforeUnload = (message: string, onUnload: (fileToPreview: DirectoryFileDTO | null) => void) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const e = event || window.event;
      if (e) {
        e.preventDefault();
        e.returnValue = message;
      }
      return message;
    };
    const handleUnload = () => {
      onUnload(null);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [message, onUnload]);
};

export default useBeforeUnload;
