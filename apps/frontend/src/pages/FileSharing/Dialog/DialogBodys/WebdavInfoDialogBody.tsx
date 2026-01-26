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
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faExternalLink, faUser } from '@fortawesome/free-solid-svg-icons';
import WEBDAV_TUTORIAL_LINKS from '@libs/filesharing/constants/webdavTutorialLinks';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import copyToClipboard from '@/utils/copyToClipboard';

interface WebdavInfoDialogBodyProps {
  webdavUrl: string;
  username: string;
}

const WebdavInfoDialogBody: React.FC<WebdavInfoDialogBodyProps> = ({ webdavUrl, username }) => {
  const { t } = useTranslation();

  const handleCopyUrl = () => {
    copyToClipboard(webdavUrl);
  };

  const handleCopyUsername = () => {
    copyToClipboard(username);
  };

  return (
    <div className="flex flex-col gap-4 text-background">
      <p className="text-muted-foreground">{t('filesharing.webdavInfo.description')}</p>

      <div>
        <p className="mb-2 font-bold">{t('filesharing.webdavInfo.url')}</p>
        <InputWithActionIcons
          type="text"
          variant="dialog"
          value={webdavUrl}
          readOnly
          onMouseDown={(e) => {
            e.preventDefault();
            handleCopyUrl();
          }}
          actionIcons={[
            {
              icon: faCopy,
              onClick: handleCopyUrl,
            },
          ]}
        />
      </div>

      <div>
        <p className="mb-2 font-bold">{t('filesharing.webdavInfo.username')}</p>
        <InputWithActionIcons
          type="text"
          variant="dialog"
          value={username}
          readOnly
          onMouseDown={(e) => {
            e.preventDefault();
            handleCopyUsername();
          }}
          actionIcons={[
            {
              icon: faCopy,
              onClick: handleCopyUsername,
            },
          ]}
        />
      </div>

      <div className="flex items-center gap-2 rounded-md bg-muted-background p-3 text-sm">
        <FontAwesomeIcon
          icon={faUser}
          className="h-4 w-4"
        />
        <span>{t('filesharing.webdavInfo.passwordHint')}</span>
      </div>

      <div>
        <p className="mb-2 font-bold">{t('filesharing.webdavInfo.tutorialsTitle')}</p>
        <ul className="space-y-2">
          {WEBDAV_TUTORIAL_LINKS.map((link) => (
            <li key={link.key}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-ciLightBlue hover:underline"
              >
                <FontAwesomeIcon
                  icon={faExternalLink}
                  className="h-3 w-3"
                />
                {t(`filesharing.webdavInfo.tutorials.${link.key}`)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebdavInfoDialogBody;
