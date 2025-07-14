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

export const INPUT_VARIANT_DEFAULT = 'bg-accent text-secondary placeholder:text-p focus:outline-none';
export const INPUT_VARIANT_DIALOG = 'bg-muted placeholder:text-p focus:outline-none text-background';
export const INPUT_DEFAULT =
  'flex h-9 rounded-md px-3 py-1 text-p text-background shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export const GRID_FIELD =
  'mx-auto grid max-h-full w-full grid-cols-[repeat(auto-fit,minmax(8rem,auto))] justify-center gap-x-3 gap-y-2 overflow-auto pb-10 scrollbar-thin md:max-h-full md:w-[95%] md:grid-cols-[repeat(auto-fit,minmax(12rem,auto))] md:gap-x-6 md:gap-y-5 md:pb-4';
export const GRID_SEARCH =
  'mx-auto my-3 block w-[80%] min-w-[250px] rounded-xl border border-ring px-3 py-2 md:mb-2 md:mt-0 md:w-[400px]';
export const GRID_CARD =
  'h-26 relative flex w-full flex-col items-center overflow-hidden border border-muted-light bg-muted-dialog p-5 hover:bg-primary';
