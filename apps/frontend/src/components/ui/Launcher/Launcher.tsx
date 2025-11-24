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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import LauncherAppGrid from '@/components/ui/Launcher/LauncherAppGrid';
import useModKeyLabel from '@/hooks/useModKeyLabel';
import useKeyboardShortcut from '@/hooks/useKeyboardShortcut';

const Launcher = () => {
  const { isLauncherOpen, toggleLauncher } = useLauncherStore();
  const modKeyLabel = useModKeyLabel();

  useKeyboardShortcut([{ key: 'k', ctrlKey: true, callback: toggleLauncher, altKey: false, shiftKey: false }]);

  return (
    <AdaptiveDialog
      isOpen={isLauncherOpen}
      handleOpenChange={toggleLauncher}
      title=""
      desktopContentClassName="max-h-[95%] max-w-[90%] z-[999]"
      mobileContentClassName="h-full z-[999] flex flex-col pb-0"
      body={<LauncherAppGrid modKeyLabel={modKeyLabel} />}
    />
  );
};

export default Launcher;
