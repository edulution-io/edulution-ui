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

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, description, children }) => (
    <div className="rounded-lg border border-ciLightGrey/20 bg-ciDarkGrey/50 p-6">
      <div className="flex items-start gap-4">
        {icon}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-background">{title}</h2>
          <p className="mt-1 text-sm text-ciLightGrey">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );

export default SettingsCard;
