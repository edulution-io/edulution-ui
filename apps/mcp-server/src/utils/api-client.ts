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

import axios, { AxiosError, AxiosInstance } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(token: string, baseUrl?: string) {
    const apiUrl = baseUrl || process.env.EDU_API_URL || 'http://localhost:3000/edu-api';

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const response = error.response?.data as ApiErrorResponse | undefined;
      const message = response?.message || response?.error || error.message;
      throw new Error(message);
    }
    throw error;
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      const response = await this.client.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T>(endpoint: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.patch<T>(endpoint, data, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(endpoint: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.delete<T>(endpoint, { data, params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async postRaw<T>(
    endpoint: string,
    content: string,
    params?: Record<string, unknown>,
    contentType = 'text/plain',
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, content, {
        params,
        headers: { 'Content-Type': contentType },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default ApiClient;
