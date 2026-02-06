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

import TEXT_COLOR_VARIANT from '@libs/ui/constants/textColorVariant';
import type FooterColors from '@libs/ui/types/footerColors';

const BRIGHTNESS_THRESHOLD = 128;

const parseColor = (colorStr: string): { r: number; g: number; b: number } | null => {
  if (colorStr.startsWith('rgb')) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
    }
  }
  return null;
};

const calculateBrightness = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;

const getFirstColorFromGradient = (gradient: string): { r: number; g: number; b: number } | null => {
  const rgbMatch = gradient.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) };
  }
  return null;
};

const detectIframeColor = (iframe: HTMLIFrameElement): NonNullable<FooterColors> => {
  const defaultResult: NonNullable<FooterColors> = {
    backgroundColor: '#ffffff',
    textColor: TEXT_COLOR_VARIANT.DARK,
  };

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc?.body) return defaultResult;

    const computedStyle = iframeDoc.defaultView?.getComputedStyle(iframeDoc.body);
    if (!computedStyle) return defaultResult;

    const bgColor = computedStyle.backgroundColor;
    const bgImage = computedStyle.backgroundImage;

    let rgb: { r: number; g: number; b: number } | null = null;

    if (bgImage && bgImage !== 'none') {
      rgb = getFirstColorFromGradient(bgImage);
    }

    if (!rgb && bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      rgb = parseColor(bgColor);
    }

    if (!rgb) return defaultResult;

    const brightness = calculateBrightness(rgb.r, rgb.g, rgb.b);
    const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);

    return {
      backgroundColor: hexColor,
      textColor: brightness > BRIGHTNESS_THRESHOLD ? TEXT_COLOR_VARIANT.DARK : TEXT_COLOR_VARIANT.LIGHT,
    };
  } catch {
    return defaultResult;
  }
};

export default detectIframeColor;
