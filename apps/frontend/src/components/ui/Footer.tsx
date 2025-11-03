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

import React from 'react';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import { Link } from 'react-router-dom';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';

const Footer = () => {
  const { language } = useLanguage();

  const publicAppConfigs = useAppConfigsStore((s) => s.publicAppConfigs);

  return (
    <footer className="bg-background-centered-shadow w-full p-2 text-sm text-muted">
      <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-4">
        <span className="text-center md:text-left">
          &copy; {new Date().getFullYear()} {APPLICATION_NAME}.
          <span className="hidden md:inline"> All rights reserved.</span> V{APP_VERSION}
        </span>

        <div className="mt-1 flex flex-wrap justify-center gap-2 leading-none scrollbar-thin md:mt-0 md:flex-nowrap md:overflow-x-auto md:whitespace-nowrap md:leading-[inherit]">
          {publicAppConfigs.map((config) => (
            <Link
              key={config.name}
              to={`/${config.name}`}
            >
              {getDisplayName(config, language)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
export default Footer;
