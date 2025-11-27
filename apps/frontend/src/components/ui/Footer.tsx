/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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

        <div className="mt-1 flex flex-wrap justify-center gap-2 leading-tight scrollbar-thin md:mt-0 md:flex-nowrap md:overflow-x-auto md:whitespace-nowrap md:leading-[inherit]">
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
