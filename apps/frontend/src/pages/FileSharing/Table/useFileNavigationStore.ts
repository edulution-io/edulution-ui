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

import create from 'zustand';

type HistoryState = {
  pastFiles: string[];
  presentPath: string;
  futureFiles: string[];
  navigate: (path: string) => void;
  setPresentPath?: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  reset: (newInitial: string) => void;
};

const initialState = {
  pastFiles: [],
  presentPath: '/',
  futureFiles: [],
};

const useFileNavigationStore = create<HistoryState>((set, get) => ({
  ...initialState,

  navigate: (newPath: string) => {
    const { pastFiles, presentPath } = get();
    if (newPath === presentPath) return;
    set({
      pastFiles: [...pastFiles, presentPath],
      presentPath: newPath,
      futureFiles: [],
    });
  },

  setPresentPath: (newPath: string) => {
    get().navigate(newPath);
  },

  goBack: () => {
    const { pastFiles, presentPath, futureFiles } = get();
    if (pastFiles.length === 0) return;
    const previous = pastFiles[pastFiles.length - 1];
    set({
      pastFiles: pastFiles.slice(0, -1),
      presentPath: previous,
      futureFiles: [presentPath, ...futureFiles],
    });
  },

  goForward: () => {
    const { pastFiles, presentPath, futureFiles } = get();
    if (futureFiles.length === 0) return;
    const [next, ...rest] = futureFiles;
    set({
      pastFiles: [...pastFiles, presentPath],
      presentPath: next,
      futureFiles: rest,
    });
  },

  reset: (newInitial: string) => {
    set({
      pastFiles: [],
      presentPath: newInitial,
      futureFiles: [],
    });
  },
}));

export default useFileNavigationStore;
