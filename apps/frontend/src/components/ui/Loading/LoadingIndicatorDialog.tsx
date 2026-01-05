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

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useOnClickOutside } from 'usehooks-ts';
import { useLocation } from 'react-router-dom';

interface LoadingIndicatorDialogProps {
  isOpen: boolean;
}

const LoadingIndicatorDialog: React.FC<LoadingIndicatorDialogProps> = ({ isOpen }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(isOpen);
  const location = useLocation();

  useOnClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen, location]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="flex w-40 flex-col items-center justify-center rounded-xl bg-overlay-transparent p-6 shadow-lg"
        ref={containerRef}
      >
        <CircleLoader />
      </div>
    </div>,
    document.body,
  );
};

export default LoadingIndicatorDialog;
