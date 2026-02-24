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

const BASE_CHARS_PER_FRAME = 2;
const CATCHUP_DIVISOR = 10;
const CATCHUP_THRESHOLD = 50;

const StreamingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const targetRef = useRef(text);
  const displayedLenRef = useRef(0);
  const rafRef = useRef(0);
  const isRunningRef = useRef(false);

  const startAnimation = () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const animate = () => {
      const target = targetRef.current;
      if (displayedLenRef.current < target.length) {
        const buffer = target.length - displayedLenRef.current;
        const step = buffer > CATCHUP_THRESHOLD ? Math.ceil(buffer / CATCHUP_DIVISOR) : BASE_CHARS_PER_FRAME;
        displayedLenRef.current = Math.min(displayedLenRef.current + step, target.length);
        setDisplayed(target.slice(0, displayedLenRef.current));
        rafRef.current = requestAnimationFrame(animate);
      } else {
        isRunningRef.current = false;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    targetRef.current = text;
    startAnimation();
    return () => cancelAnimationFrame(rafRef.current);
  }, [text]);

  return <p className="whitespace-pre-wrap break-words text-sm">{displayed}</p>;
};

export default StreamingText;
