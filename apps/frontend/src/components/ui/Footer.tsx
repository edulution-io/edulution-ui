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
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { isMobileView } = useMedia();
  const { t } = useTranslation();

  return (
    <footer className="bg-background-centered-shadow flex h-[22px] w-full justify-center gap-2 overflow-hidden whitespace-nowrap text-muted">
      &copy; {new Date().getFullYear()} {APPLICATION_NAME}. {!isMobileView && 'All rights reserved.'} V{APP_VERSION}
      <Link to={`${window.location.origin}/imprint`}>{t('imprint')}</Link>
    </footer>
  );
};
export default Footer;
