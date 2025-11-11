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
import { Button } from '@/components/shared/Button';
import { Card, CardContent } from '@/components/shared/Card';
import { useNavigate } from 'react-router-dom';
import { USER_SETTINGS_MOBILE_ACCESS_PATH } from '@libs/userSettings/constants/user-settings-endpoints';

const MobileFileAccessCard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Card
      variant="security"
      className="h-full"
    >
      <CardContent>
        <h4 className="mb-6 font-bold">{t('dashboard.mobileAccess.title')}</h4>
        <p className="mb-6">{t('dashboard.mobileAccess.content')}</p>
        <Button
          className="bottom-6"
          variant="btn-infrastructure"
          size="lg"
          onClick={() => navigate(USER_SETTINGS_MOBILE_ACCESS_PATH)}
        >
          <p>{t('dashboard.mobileAccess.manual')}</p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileFileAccessCard;
