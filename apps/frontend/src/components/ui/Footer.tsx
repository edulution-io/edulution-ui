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

import useMedia from '@/hooks/useMedia';
import React from 'react';

const Footer = () => {
  const { isMobileView } = useMedia();

  return (
    <footer className="bg-background-centered-shadow flex h-[22px] w-full justify-center overflow-hidden whitespace-nowrap text-muted">
      &copy; {new Date().getFullYear()} edulution.io - {!isMobileView && 'All rights reserved.'} V{APP_VERSION}
    </footer>
  );
};
export default Footer;
