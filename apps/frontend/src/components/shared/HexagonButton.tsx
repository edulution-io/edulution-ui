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

import React, { forwardRef } from 'react';

interface HexagonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const HexagonButton = forwardRef<HTMLButtonElement, HexagonButtonProps>(({ children, onClick }, ref) => (
  <div>
    <button
      ref={ref}
      onClick={onClick}
      className="border-1 group relative flex h-8 w-8 items-center justify-center overflow-hidden border-ciGreen border-opacity-0 bg-ciGreen text-background transition-colors hover:border-opacity-100"
      style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
      type="button"
    >
      <span
        className="absolute inset-0 origin-center scale-x-0 transform bg-ciGreen transition-transform group-hover:scale-x-100"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  </div>
));

HexagonButton.displayName = 'HexagonButton';
export default HexagonButton;
