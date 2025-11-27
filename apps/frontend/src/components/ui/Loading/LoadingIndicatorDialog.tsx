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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { useOnClickOutside } from 'usehooks-ts';
import { useLocation } from 'react-router-dom';

interface LoadingIndicatorDialogProps {
  isOpen: boolean;
}

const LoadingIndicatorDialog: React.FC<LoadingIndicatorDialogProps> = ({ isOpen }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(isOpen);
  const location = useLocation();

  useOnClickOutside(dialogRef, () => setOpen(false));

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen, location]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent
        showCloseButton={false}
        variant="loadingSpinner"
      >
        <DialogTitle aria-disabled />
        <DialogHeader>
          <div
            className="flex flex-col items-center justify-center space-y-4"
            ref={dialogRef}
          >
            <CircleLoader />
          </div>
        </DialogHeader>
        <DialogDescription aria-disabled />
      </DialogContent>
    </Dialog>
  );
};

export default LoadingIndicatorDialog;
