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

import { useCallback, useRef, useState } from 'react';

const useHistoryFileNavigationDialog = (initialPath: string = '/') => {
  const initRef = useRef(initialPath || '/');

  const [{ past, present, future }, setState] = useState(() => ({
    past: [] as string[],
    present: initRef.current,
    future: [] as string[],
  }));

  const setPresent = useCallback(
    (next: string = '/', clearFuture = true) =>
      setState((s) =>
        !next || next === s.present
          ? s
          : {
              past: s.present ? [...s.past, s.present] : s.past,
              present: next,
              future: clearFuture ? [] : s.future,
            },
      ),
    [],
  );

  const navigate = useCallback((next: string) => setPresent(next, true), [setPresent]);
  const goBack = useCallback(
    () =>
      setState((s) =>
        s.past.length
          ? {
              past: s.past.slice(0, -1),
              present: s.past[s.past.length - 1],
              future: [s.present, ...s.future],
            }
          : s,
      ),
    [],
  );
  const goForward = useCallback(
    () =>
      setState((s) =>
        s.future.length
          ? {
              past: [...s.past, s.present],
              present: s.future[0],
              future: s.future.slice(1),
            }
          : s,
      ),
    [],
  );
  const reset = useCallback(
    (newInitial: string = '/') => setState({ past: [], present: newInitial || '/', future: [] }),
    [],
  );

  return { past, present, future, navigate, goBack, goForward, reset, setPresent };
};

export default useHistoryFileNavigationDialog;
