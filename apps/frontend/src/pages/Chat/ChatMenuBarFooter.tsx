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
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import useChatStore from '@/store/useChatStore';
import { Button } from '@edulution-io/ui-kit';

interface ChatMenuBarFooterProps {
  isCollapsed: boolean;
}

const ChatMenuBarFooter: React.FC<ChatMenuBarFooterProps> = ({ isCollapsed }) => {
  const { t } = useTranslation();
  const { fetchUserGroups, isLoadingGroups } = useChatStore();

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="border-t border-muted px-3 py-4">
      <Button
        type="button"
        variant="btn-ghost"
        disabled={isLoadingGroups}
        onClick={() => fetchUserGroups()}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-muted-background disabled:opacity-50"
      >
        <FontAwesomeIcon
          icon={faRotate}
          className="h-4 w-4"
          spin={isLoadingGroups}
        />
        <span className="text-sm">{t('chat.refreshGroups')}</span>
      </Button>
    </div>
  );
};

export default ChatMenuBarFooter;
