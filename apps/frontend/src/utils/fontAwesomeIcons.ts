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

const brandIcons = import.meta.glob('@/assets/icons/fontawsome-brands/*.svg', {
  eager: false,
  query: '?url',
  import: 'default',
});

const solidIcons = import.meta.glob('@/assets/icons/fontawsome-solid/*.svg', {
  eager: false,
  query: '?url',
  import: 'default',
});

const parseIconPath = (path: string, category: 'brands' | 'solid'): FontAwesomeIcon => {
  const name = path.split('/').pop()?.replace('.svg', '') || '';
  return {
    name,
    category,
    path,
  };
};

export const getFontAwesomeIconList = (): FontAwesomeIcon[] => {
  const brands = Object.keys(brandIcons).map((path) => parseIconPath(path, 'brands'));
  const solid = Object.keys(solidIcons).map((path) => parseIconPath(path, 'solid'));

  return [...brands, ...solid].sort((a, b) => a.name.localeCompare(b.name));
};

export const loadFontAwesomeIcon = async (icon: FontAwesomeIcon): Promise<string> => {
  const iconModules = icon.category === 'brands' ? brandIcons : solidIcons;
  const loader = iconModules[icon.path];

  if (!loader) {
    throw new Error(`Icon not found: ${icon.path}`);
  }

  const module = await loader();
  return module as string;
};
