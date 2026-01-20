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

export interface FontAwesomeIcon {
  name: string;
  category: 'brands' | 'solid';
  path: string;
}

const brandIconsGlob = import.meta.glob('@/assets/icons/fontawsome-brands/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const solidIconsGlob = import.meta.glob('@/assets/icons/fontawsome-solid/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const getIconUrl = (fileName: string, category: 'brands' | 'solid'): string => {
  const iconGlob = category === 'brands' ? brandIconsGlob : solidIconsGlob;
  const globKey = Object.keys(iconGlob).find((key) => key.endsWith(`/${fileName}.svg`));
  const globUrl = globKey ? (iconGlob[globKey] as string) : '';

  if (globUrl && globUrl.startsWith('/src/')) {
    return globUrl;
  }

  return `/assets/fontawsome-${category}/${fileName}.svg`;
};

const parseIconFromPath = (sourcePath: string, category: 'brands' | 'solid'): FontAwesomeIcon => {
  const fileName = sourcePath.split('/').pop()?.replace('.svg', '') || '';
  const path = getIconUrl(fileName, category);

  return {
    name: fileName,
    category,
    path,
  };
};

export const getFontAwesomeIconList = (): FontAwesomeIcon[] => {
  const brands = Object.keys(brandIconsGlob).map((path) => parseIconFromPath(path, 'brands'));
  const solid = Object.keys(solidIconsGlob).map((path) => parseIconFromPath(path, 'solid'));

  return [...brands, ...solid].sort((a, b) => a.name.localeCompare(b.name));
};

export const loadFontAwesomeIcon = (icon: FontAwesomeIcon): Promise<string> => Promise.resolve(icon.path);

export const resolveFontAwesomeIconUrl = (storedPath: string): string => {
  const category = storedPath.includes('fontawsome-brands') ? 'brands' : 'solid';
  const fileName = storedPath.split('/').pop()?.replace('.svg', '') || '';
  return getIconUrl(fileName, category);
};
