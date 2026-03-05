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

import {
  FONT_AWESOME_BRANDS_IDENTIFIER,
  FONT_AWESOME_SOLID_IDENTIFIER,
  ICON_CATEGORY_BRANDS,
  ICON_CATEGORY_SOLID,
} from '@libs/ui/constants/icon';
import type { IconCategory } from '@libs/ui/constants/icon';

export interface FontAwesomeIcon {
  name: string;
  category: IconCategory;
  path: string;
}

const brandIconKeys = Object.keys(import.meta.glob('/public/assets/fontawsome-brands/*.svg', { eager: false }));

const solidIconKeys = Object.keys(import.meta.glob('/public/assets/fontawsome-solid/*.svg', { eager: false }));

const getIconUrl = (fileName: string, category: IconCategory): string => {
  const identifier = category === ICON_CATEGORY_BRANDS ? FONT_AWESOME_BRANDS_IDENTIFIER : FONT_AWESOME_SOLID_IDENTIFIER;
  return `/assets/${identifier}/${fileName}.svg`;
};

const parseIconFromPath = (sourcePath: string, category: IconCategory): FontAwesomeIcon => {
  const fileName = sourcePath.split('/').pop()?.replace('.svg', '') || '';
  const path = getIconUrl(fileName, category);

  return {
    name: fileName,
    category,
    path,
  };
};

export const getFontAwesomeIconList = (): FontAwesomeIcon[] => {
  const brands = brandIconKeys.map((path) => parseIconFromPath(path, ICON_CATEGORY_BRANDS));
  const solid = solidIconKeys.map((path) => parseIconFromPath(path, ICON_CATEGORY_SOLID));

  return [...brands, ...solid].sort((a, b) => a.name.localeCompare(b.name));
};

export const loadFontAwesomeIcon = (icon: FontAwesomeIcon): Promise<string> => Promise.resolve(icon.path);

export const resolveFontAwesomeIconUrl = (storedPath: string): string => {
  const category: IconCategory = storedPath.includes(FONT_AWESOME_BRANDS_IDENTIFIER)
    ? ICON_CATEGORY_BRANDS
    : ICON_CATEGORY_SOLID;
  const fileName = storedPath.split('/').pop()?.replace('.svg', '') || '';
  return getIconUrl(fileName, category);
};
