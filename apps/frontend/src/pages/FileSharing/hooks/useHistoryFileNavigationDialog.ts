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

import { useCallback, useState } from 'react';

const useHistoryFileNavigationDialog = (initialPath: string) => {
  const [pastFiles, setPastFiles] = useState<string[]>([]);
  const [presentPath, setPresentPath] = useState(initialPath);
  const [futureFiles, setFutureFiles] = useState<string[]>([]);

  const navigate = useCallback(
    (newPath: string) => {
      if (newPath === presentPath) return;
      setPastFiles((past) => [...past, presentPath]);
      setPresentPath(newPath);
      setFutureFiles([]);
    },
    [presentPath],
  );

  const goBack = useCallback(() => {
    setPastFiles((past) => {
      if (past.length === 0) return past;
      const previousFile = past[past.length - 1];
      setFutureFiles((future) => [presentPath, ...future]);
      setPresentPath(previousFile);
      return past.slice(0, -1);
    });
  }, [presentPath]);

  const goForward = useCallback(() => {
    setFutureFiles((future) => {
      if (future.length === 0) return future;
      const [next, ...rest] = future;
      setPastFiles((past) => [...past, presentPath]);
      setPresentPath(next);
      return rest;
    });
  }, [presentPath]);

  const reset = useCallback((newInitial: string) => {
    setPastFiles([]);
    setPresentPath(newInitial);
    setFutureFiles([]);
  }, []);

  return {
    past: pastFiles,
    present: presentPath,
    future: futureFiles,
    navigate,
    goBack,
    goForward,
    reset,
    setPresent: setPresentPath,
  };
};

export default useHistoryFileNavigationDialog;
