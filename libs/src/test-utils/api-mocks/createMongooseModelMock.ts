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

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
const createChainableProxy = (finalValue: unknown): unknown =>
  new Proxy(() => finalValue, {
    get: (_target, prop) => {
      if (prop === 'exec') return () => Promise.resolve(finalValue);
      if (prop === 'then') return undefined;
      if (prop === 'lean') return () => createChainableProxy(finalValue);
      return (..._args: unknown[]) => createChainableProxy(finalValue);
    },
    apply: () => createChainableProxy(finalValue),
  });

const createMongooseModelMock = <T>(defaultResult: T | T[] = [] as unknown as T) => ({
  find: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  findOne: jest
    .fn()
    .mockImplementation(() => createChainableProxy(Array.isArray(defaultResult) ? defaultResult[0] : defaultResult)),
  findById: jest
    .fn()
    .mockImplementation(() => createChainableProxy(Array.isArray(defaultResult) ? defaultResult[0] : defaultResult)),
  create: jest.fn().mockResolvedValue(defaultResult),
  findByIdAndUpdate: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  findByIdAndDelete: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  findOneAndUpdate: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  findOneAndDelete: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  countDocuments: jest.fn().mockImplementation(() => createChainableProxy(0)),
  deleteMany: jest.fn().mockImplementation(() => createChainableProxy({ deletedCount: 0 })),
  updateMany: jest.fn().mockImplementation(() => createChainableProxy({ modifiedCount: 0 })),
  aggregate: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  distinct: jest.fn().mockResolvedValue([]),
});

export default createMongooseModelMock;
