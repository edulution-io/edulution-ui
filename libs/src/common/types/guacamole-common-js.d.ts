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

import '@glokon/guacamole-common-js';

declare module '@glokon/guacamole-common-js' {
  namespace Mouse {
    interface Touchscreen {
      onmousedown?: (state: Mouse.State) => void;
      onmouseup?: (state: Mouse.State) => void;
      onmousemove?: (state: Mouse.State) => void;
    }
  }
  interface Mouse {
    onmousedown?: (state: Mouse.State) => void;
    onmouseup?: (state: Mouse.State) => void;
    onmousemove?: (state: Mouse.State) => void;
  }

  interface Touch {
    ontouchstart?: (state: Touch.State) => void;
    ontouchend?: (state: Touch.State) => void;
    ontouchmove?: (state: Touch.State) => void;
  }
}
