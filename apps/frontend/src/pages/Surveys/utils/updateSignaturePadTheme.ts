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

import type { Model } from 'survey-core';
import THEME from '@libs/common/constants/theme';

const updateSignaturePadTheme = (model: Model, getResolvedTheme: () => string): void => {
  const penColor = getResolvedTheme() === THEME.dark ? 'rgba(255, 255, 255, 1)' : 'rgba(17, 24, 39, 1)';
  model
    .getAllQuestions()
    .filter((q) => q.getType() === 'signaturepad')
    .forEach((signaturePad) => {
      Object.assign(signaturePad, { penColor });

      if (!signaturePad.value) return;
      const canvas = document.querySelector<HTMLCanvasElement>(`[data-name="${signaturePad.name}"] .sjs_sp_canvas`);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width, height } = canvas;
      const imageData = ctx.getImageData(0, 0, width, height);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] >= 10) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
      }
      ctx.putImageData(imageData, 0, 0);
      Object.assign(signaturePad, { value: canvas.toDataURL() });
    });
};

export default updateSignaturePadTheme;
