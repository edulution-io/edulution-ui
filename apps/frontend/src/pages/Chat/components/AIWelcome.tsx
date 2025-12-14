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
import useUserStore from '@/store/UserStore/useUserStore';
import AILogo from '@/components/shared/AILogo';
import useAIChatStore from '@/pages/Chat/hooks/useAIChatStore';

const AIWelcome: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { aiConfig } = useAIChatStore();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ciGreenToBlue">
        <AILogo
          provider={aiConfig?.provider}
          size="lg"
        />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold text-background">
          {t('chat.aiWelcomeTitle', { name: user?.firstName })}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('chat.aiWelcomeSubtitle')}</p>
      </div>
    </div>
  );
};

export default AIWelcome;
