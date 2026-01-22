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

import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const getAppIconClassName = (iconSrc: string | IconDefinition): string => {
  if (typeof iconSrc !== 'string') return '';

  const isWebp = iconSrc.endsWith('.webp') || iconSrc.includes('data:image/webp');
  if (isWebp) return '';

  const isSvgIcon = iconSrc.endsWith('.svg') || iconSrc.includes('data:image/svg+xml') || iconSrc.includes('.svg');
  if (!isSvgIcon) return '';

  const isEdulutionIcon = iconSrc.includes('/edulution/edu_');
  if (isEdulutionIcon) return 'light:icon-light-mode';

  const decodedIconSrc = decodeURIComponent(iconSrc);
  const hasWhiteColor = decodedIconSrc.includes('#fff') || decodedIconSrc.includes('#FFF');
  return hasWhiteColor ? 'light:icon-light-mode' : '';
};

export default getAppIconClassName;
