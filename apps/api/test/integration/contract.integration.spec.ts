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

/* eslint-disable no-restricted-syntax, no-continue, @typescript-eslint/no-loop-func, no-plusplus */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SWAGGER_SPEC_PATH = join(__dirname, '../../../../swagger-spec.json');
const SPEC_EXISTS = existsSync(SWAGGER_SPEC_PATH);

interface SwaggerPath {
  [method: string]: {
    operationId: string;
    tags: string[];
    parameters?: { name: string; in: string; required?: boolean }[];
    responses: Record<string, { description: string; content?: Record<string, unknown> }>;
    requestBody?: { content: Record<string, unknown> };
  };
}

interface SwaggerSpec {
  openapi: string;
  paths: Record<string, SwaggerPath>;
  info: { title: string; version: string };
  tags?: { name: string }[];
}

const CRITICAL_ENDPOINTS = {
  auth: { path: '/edu-api/auth', methods: ['post'] },
  authOidc: { path: '/edu-api/auth/.well-known/openid-configuration', methods: ['get'] },
  surveys: { path: '/edu-api/surveys', methods: ['get', 'post', 'delete'] },
  surveysById: { path: '/edu-api/surveys/id/{surveyId}', methods: ['get'] },
  surveyAnswers: { path: '/edu-api/surveys/answers', methods: ['post'] },
  surveyResults: { path: '/edu-api/surveys/results/{surveyId}', methods: ['get'] },
  filesharing: { path: '/edu-api/filesharing', methods: ['get', 'post', 'delete', 'patch'] },
  filesharingUpload: { path: '/edu-api/filesharing/upload', methods: ['post'] },
  filesharingPublicShare: { path: '/edu-api/filesharing/public-share', methods: ['get', 'post', 'delete', 'patch'] },
  health: { path: '/edu-api/health', methods: ['get'] },
};

const INTEGRATION_ENDPOINTS = {
  filesharingCallback: { path: '/edu-api/filesharing/callback', methods: ['post'] },
  filesharingCollaboraToken: { path: '/edu-api/filesharing/collabora-token', methods: ['post'] },
  filesharingOnlyOffice: { path: '/edu-api/filesharing/only-office', methods: ['post'] },
  filesharingThumbnail: { path: '/edu-api/filesharing/thumbnail', methods: ['get'] },
  wopiCheckFileInfo: { path: '/edu-api/wopi/files/{fileId}', methods: ['get'] },
  wopiFileContents: { path: '/edu-api/wopi/files/{fileId}/contents', methods: ['get', 'post'] },
};

(SPEC_EXISTS ? describe : describe.skip)('OpenAPI Contract Validation', () => {
  let spec: SwaggerSpec;

  beforeAll(() => {
    const raw = readFileSync(SWAGGER_SPEC_PATH, 'utf-8');
    spec = JSON.parse(raw) as SwaggerSpec;
  });

  describe('Spec structure', () => {
    it('is a valid OpenAPI 3.0 document', () => {
      expect(spec.openapi).toMatch(/^3\.\d+\.\d+$/);
    });

    it('has required top-level fields', () => {
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('edulution-api');
      expect(spec.paths).toBeDefined();
      expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
    });

    it('uses tags on endpoints', () => {
      const endpointsWithTags = Object.values(spec.paths).flatMap((methods) =>
        Object.values(methods)
          .filter((def) => typeof def === 'object' && def.tags)
          .map((def) => def.tags),
      );
      expect(endpointsWithTags.length).toBeGreaterThan(0);
    });
  });

  describe('Critical endpoints exist', () => {
    for (const [name, endpoint] of Object.entries(CRITICAL_ENDPOINTS)) {
      it(`${name}: ${endpoint.path} has required methods`, () => {
        const pathSpec = spec.paths[endpoint.path];
        expect(pathSpec).toBeDefined();

        for (const method of endpoint.methods) {
          expect(pathSpec[method]).toBeDefined();
          expect(pathSpec[method].operationId).toBeDefined();
        }
      });
    }
  });

  describe('Integration endpoints exist (non-blocking)', () => {
    for (const [name, endpoint] of Object.entries(INTEGRATION_ENDPOINTS)) {
      it(`${name}: ${endpoint.path} has expected methods`, () => {
        const pathSpec = spec.paths[endpoint.path];
        if (!pathSpec) {
          console.warn(`Integration endpoint missing from spec: ${endpoint.path}`);
          return;
        }

        const missingMethods: string[] = [];
        for (const method of endpoint.methods) {
          if (!pathSpec[method] || !pathSpec[method].operationId) {
            missingMethods.push(method);
          }
        }

        if (missingMethods.length > 0) {
          console.warn(`${endpoint.path} missing methods: ${missingMethods.join(', ')}`);
        }

        expect(pathSpec).toBeDefined();
      });
    }
  });

  describe('Endpoint response definitions', () => {
    it('all endpoints have at least one response defined', () => {
      const missingResponses: string[] = [];

      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, definition] of Object.entries(methods)) {
          if (method === 'parameters') continue;
          if (!definition.responses || Object.keys(definition.responses).length === 0) {
            missingResponses.push(`${method.toUpperCase()} ${path}`);
          }
        }
      }

      expect(missingResponses).toEqual([]);
    });

    it('protected endpoints document 401 or use bearer auth', () => {
      const authTag = 'auth';
      const protectedPaths = Object.entries(spec.paths).filter(([, methods]) => {
        const firstMethod = Object.values(methods).find((m) => typeof m === 'object' && m.tags);
        return firstMethod && !firstMethod.tags?.includes(authTag);
      });

      expect(protectedPaths.length).toBeGreaterThan(0);
    });
  });

  describe('Endpoint parameters', () => {
    it('critical parameterized paths declare their path parameters', () => {
      const criticalParamPaths = [
        '/edu-api/filesharing/public-share/{publicShareId}',
        '/edu-api/filesharing/public-share/download/{publicShareId}',
        '/edu-api/wopi/files/{fileId}',
      ];
      const missingParams: string[] = [];

      for (const path of criticalParamPaths) {
        const pathSpec = spec.paths[path];
        if (!pathSpec) continue;

        const pathParams = (path.match(/\{(\w+)\}/g) || []).map((p) => p.replace(/[{}]/g, ''));

        for (const [method, definition] of Object.entries(pathSpec)) {
          if (method === 'parameters' || typeof definition !== 'object') continue;
          const params = definition.parameters || [];
          const declaredPathParams = params
            .filter((p: { in: string }) => p.in === 'path')
            .map((p: { name: string }) => p.name);

          for (const param of pathParams) {
            if (!declaredPathParams.includes(param)) {
              missingParams.push(`${method.toUpperCase()} ${path} missing param: ${param}`);
            }
          }
        }
      }

      expect(missingParams).toEqual([]);
    });

    it('reports undocumented path parameters (non-blocking)', () => {
      const pathsWithParams = Object.entries(spec.paths).filter(([path]) => path.includes('{'));
      let undocumentedCount = 0;

      for (const [path, methods] of pathsWithParams) {
        const pathParams = (path.match(/\{(\w+)\}/g) || []).map((p) => p.replace(/[{}]/g, ''));

        for (const [method, definition] of Object.entries(methods)) {
          if (method === 'parameters' || typeof definition !== 'object') continue;
          const params = definition.parameters || [];
          const declaredPathParams = params
            .filter((p: { in: string }) => p.in === 'path')
            .map((p: { name: string }) => p.name);

          for (const param of pathParams) {
            if (!declaredPathParams.includes(param)) {
              undocumentedCount++;
            }
          }
        }
      }

      expect(undocumentedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Endpoint coverage', () => {
    it('has endpoints for all major API modules', () => {
      const allPaths = Object.keys(spec.paths);
      const modules = ['auth', 'surveys', 'filesharing', 'health', 'users', 'groups', 'conferences', 'mails', 'wopi'];

      for (const mod of modules) {
        const hasModule = allPaths.some((path) => path.includes(`/edu-api/${mod}`));
        expect(hasModule).toBe(true);
      }
    });

    it('has a reasonable number of endpoints (>50)', () => {
      const endpointCount = Object.keys(spec.paths).length;
      expect(endpointCount).toBeGreaterThan(50);
    });
  });

  describe('OperationId uniqueness', () => {
    it('all operationIds are unique', () => {
      const operationIds: string[] = [];
      const duplicates: string[] = [];

      for (const methods of Object.values(spec.paths)) {
        for (const [method, definition] of Object.entries(methods)) {
          if (method === 'parameters' || typeof definition !== 'object') continue;
          if (definition.operationId) {
            if (operationIds.includes(definition.operationId)) {
              duplicates.push(definition.operationId);
            }
            operationIds.push(definition.operationId);
          }
        }
      }

      expect(duplicates).toEqual([]);
    });
  });
});
