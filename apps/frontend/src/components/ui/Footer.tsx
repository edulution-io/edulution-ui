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
import { FOOTER_ID } from '@libs/common/constants/pageElementIds';

const Footer = () => {
  const { isMobileView } = useMedia();

  return (
    <footer
      id={FOOTER_ID}
      className="fixed bottom-0 flex w-full justify-center pt-1"
    >
      <div className="bg-background-centered-shadow mx-auto w-fit rounded-t-lg  text-center">
        <p className="overflow-hidden whitespace-nowrap text-muted">
          &copy; {new Date().getFullYear()} edulution.io. {!isMobileView && 'All rights reserved.'} V{APP_VERSION}
        </p>
      </div>
    </footer>
  );
};
export default Footer;
