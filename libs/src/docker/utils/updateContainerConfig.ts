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

import { ContainerCreateOptions } from 'dockerode';

const updateContainerConfig = (
  containerConfig: ContainerCreateOptions[],
  formValues?: Record<string, string>,
): ContainerCreateOptions[] => {
  const placeholderPattern = /^<(.+)>$/;

  return containerConfig.map((service) => {
    if (!Array.isArray(service.Env)) return service;

    const updatedEnv = service.Env.map((entry) => {
      const eqIndex = entry.indexOf('=');
      if (eqIndex === -1) return entry;

      const key = entry.slice(0, eqIndex);
      const value = entry.slice(eqIndex + 1);
      const match = value.match(placeholderPattern);

      if (match && formValues) {
        return `${key}=${formValues[match[1]] ?? value}`;
      }
      return entry;
    });

    return { ...service, Env: updatedEnv };
  });
};

export default updateContainerConfig;
