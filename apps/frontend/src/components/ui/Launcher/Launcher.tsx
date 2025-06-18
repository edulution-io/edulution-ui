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

import React, { useCallback, useEffect } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useLauncherStore from '@/components/ui/Launcher/useLauncherStore';
import LauncherAppGrid from '@/components/ui/Launcher/LauncherAppGrid';
import useModKeyLabel from '@/hooks/useModKeyLabel';

const Launcher = () => {
  const { isLauncherOpen, toggleLauncher } = useLauncherStore();
  const modKeyLabel = useModKeyLabel();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleLauncher();
      }
    },
    [toggleLauncher],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
