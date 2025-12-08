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

import { parse, stringify } from 'yaml';

interface ComposeService {
  environment?: Record<string, unknown> | string[];
}

interface ComposeFile {
  services?: Record<string, ComposeService>;
}

export const parseDockerEnv = (envList: string[] | undefined): Record<string, string> => {
  if (!envList) return {};

  return envList.reduce<Record<string, string>>((acc, entry) => {
    const index = entry.indexOf('=');
    if (index === -1) {
      acc[entry] = '';
      return acc;
    }

    const key = entry.slice(0, index);
    const value = entry.slice(index + 1);

    acc[key] = value;
    return acc;
  }, {});
};

const normalizeEnvironment = (env: Record<string, unknown> | string[] | undefined): Record<string, string> => {
  if (!env) return {};

  if (Array.isArray(env)) {
    return env.reduce<Record<string, string>>((acc, line) => {
      const i = line.indexOf('=');
      if (i === -1) return acc;

      const k = line.slice(0, i);
      const v = line.slice(i + 1);

      acc[k] = v;
      return acc;
    }, {});
  }

  return Object.entries(env).reduce<Record<string, string>>((acc, [k, v]) => {
    acc[k] = v == null ? '' : String(v);
    return acc;
  }, {});
};

const removeNulls = (obj: unknown): unknown => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.entries(obj).reduce<Record<string, unknown>>((acc, [k, v]) => {
      acc[k] = v === null ? {} : removeNulls(v);
      return acc;
    }, {});
  }
  return obj;
};

export const injectEnvIntoCompose = (originalYaml: string, envVars: Record<string, string>): string => {
  const doc = parse(originalYaml) as ComposeFile;

  if (!doc.services) {
    return originalYaml;
  }

  const updatedServices = Object.entries(doc.services).reduce<Record<string, ComposeService>>(
    (svcAcc, [svcName, svc]) => {
      const envObj = normalizeEnvironment(svc.environment);

      const updatedEnv = Object.fromEntries(Object.entries(envObj).map(([k, v]) => [k, k in envVars ? envVars[k] : v]));

      return {
        ...svcAcc,
        [svcName]: {
          ...svc,
          environment: updatedEnv,
        },
      };
    },
    {},
  );

  const cleaned = removeNulls({
    ...doc,
    services: updatedServices,
  });

  return stringify(cleaned);
};
