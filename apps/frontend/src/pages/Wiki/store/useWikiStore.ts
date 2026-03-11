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

import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import WIKI_ENDPOINTS from '@libs/wiki/constants/wikiEndpoints';
import WIKI_CONSTANTS from '@libs/wiki/constants/wikiConstants';
import type WikiRegistrationDto from '@libs/wiki/types/wikiRegistrationDto';
import type WikiPageDto from '@libs/wiki/types/wikiPageDto';

const { BASE, REGISTRATIONS, PAGES, CONTENT } = WIKI_ENDPOINTS;

const buildRegistrationsUrl = () => `${BASE}/${REGISTRATIONS}`;
const buildPagesUrl = (registrationId: string) => `${BASE}/${REGISTRATIONS}/${registrationId}/${PAGES}`;
const buildPageContentUrl = (registrationId: string) =>
  `${BASE}/${REGISTRATIONS}/${registrationId}/${PAGES}/${CONTENT}`;

interface WikiStore {
  registrations: WikiRegistrationDto[];
  selectedRegistrationId: string | null;
  pages: WikiPageDto[];
  selectedPagePath: string | null;
  editorContent: string;
  editorTitle: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isDeleteDialogOpen: boolean;
  isDeleteWikiMode: boolean;
  isCreateWikiDialogOpen: boolean;
  isCreatingNewPage: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;

  fetchRegistrations: () => Promise<void>;
  createWiki: (name: string, parentPath: string, share: string) => Promise<string | undefined>;
  deleteWiki: (id: string) => Promise<void>;
  selectRegistration: (id: string | null) => void;

  fetchPages: (registrationId: string) => Promise<void>;
  fetchPageContent: (registrationId: string, relativePath: string) => Promise<void>;
  createPage: (registrationId: string, title: string, content: string) => Promise<void>;
  updatePage: (registrationId: string, relativePath: string, content: string, title?: string) => Promise<void>;
  deletePage: (registrationId: string, relativePath: string) => Promise<void>;
  selectPage: (relativePath: string | null) => void;

  setEditorContent: (content: string) => void;
  setEditorTitle: (title: string) => void;
  startNewPage: () => void;

  cancelEditing: () => void;
  setIsEditing: (editing: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsDeleteWikiMode: (mode: boolean) => void;
  setIsCreateWikiDialogOpen: (open: boolean) => void;
  reset: () => void;
}

const initialValues = {
  registrations: [],
  selectedRegistrationId: null,
  pages: [],
  selectedPagePath: null,
  editorContent: '',
  editorTitle: '',
  isLoading: false,
  isSaving: false,
  error: null,
  isDeleteDialogOpen: false,
  isDeleteWikiMode: false,
  isCreateWikiDialogOpen: false,
  isCreatingNewPage: false,
  isEditing: false,
  hasUnsavedChanges: false,
};

const useWikiStore = create<WikiStore>((set, get) => ({
  ...initialValues,
  reset: () => set(initialValues),

  fetchRegistrations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<WikiRegistrationDto[]>(buildRegistrationsUrl());
      set({ registrations: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createWiki: async (name, parentPath, share) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.post<WikiRegistrationDto>(buildRegistrationsUrl(), { name, parentPath, share });
      await get().fetchRegistrations();
      return data.id;
    } catch (error) {
      handleApiError(error, set);
      return undefined;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWiki: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(`${buildRegistrationsUrl()}/${id}`);
      set({ selectedRegistrationId: null, pages: [], selectedPagePath: null });
      await get().fetchRegistrations();
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  selectRegistration: (id) => {
    set({
      selectedRegistrationId: id,
      pages: [],
      selectedPagePath: null,
      editorContent: '',
      editorTitle: '',
      isCreatingNewPage: false,
      isEditing: false,
      hasUnsavedChanges: false,
    });
  },

  fetchPages: async (registrationId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<WikiPageDto[]>(buildPagesUrl(registrationId));
      set({ pages: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPageContent: async (registrationId, relativePath) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<string>(buildPageContentUrl(registrationId), {
        params: { path: relativePath },
      });
      set({ editorContent: data, selectedPagePath: relativePath, hasUnsavedChanges: false });

      if (relativePath === WIKI_CONSTANTS.INDEX_PAGE_NAME) {
        const registration = get().registrations.find((r) => r.id === registrationId);
        if (registration) {
          set({ editorTitle: registration.name });
        }
      } else {
        const page = get().pages.find((p) => p.relativePath === relativePath);
        if (page) {
          set({ editorTitle: page.title });
        }
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createPage: async (registrationId, title, content) => {
    set({ isSaving: true, error: null });
    try {
      const { data } = await eduApi.post<WikiPageDto>(buildPagesUrl(registrationId), { title, content });
      set({
        selectedPagePath: data.relativePath,
        isCreatingNewPage: false,
        isEditing: false,
        hasUnsavedChanges: false,
      });
      await get().fetchPages(registrationId);
      await get().fetchPageContent(registrationId, data.relativePath);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSaving: false });
    }
  },

  updatePage: async (registrationId, relativePath, content, title) => {
    set({ isSaving: true, error: null });
    try {
      const { data } = await eduApi.put<WikiPageDto>(
        buildPagesUrl(registrationId),
        { content, title },
        {
          params: { path: relativePath },
        },
      );
      const newPath = data?.relativePath || relativePath;
      set({ selectedPagePath: newPath, isEditing: false, hasUnsavedChanges: false });
      if (relativePath === WIKI_CONSTANTS.INDEX_PAGE_NAME) {
        await get().fetchRegistrations();
      }
      await get().fetchPages(registrationId);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSaving: false });
    }
  },

  deletePage: async (registrationId, relativePath) => {
    set({ isLoading: true, error: null });
    try {
      await eduApi.delete(buildPagesUrl(registrationId), {
        params: { path: relativePath },
      });
      set({ selectedPagePath: null, editorContent: '', editorTitle: '', hasUnsavedChanges: false });
      await get().fetchPages(registrationId);
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  selectPage: (relativePath) => {
    set({ selectedPagePath: relativePath, isCreatingNewPage: false, isEditing: false, hasUnsavedChanges: false });
  },

  setEditorContent: (content) => set({ editorContent: content, hasUnsavedChanges: true }),
  setEditorTitle: (title) => set({ editorTitle: title, hasUnsavedChanges: true }),

  startNewPage: () => {
    set({
      selectedPagePath: null,
      editorContent: '',
      editorTitle: '',
      isCreatingNewPage: true,
      isEditing: true,
      hasUnsavedChanges: false,
    });
  },

  cancelEditing: () => {
    const { selectedRegistrationId, selectedPagePath, isCreatingNewPage } = get();
    if (isCreatingNewPage) {
      if (selectedRegistrationId) {
        void get().fetchPageContent(selectedRegistrationId, WIKI_CONSTANTS.INDEX_PAGE_NAME);
      }
      set({ isCreatingNewPage: false, isEditing: false, hasUnsavedChanges: false });
    } else if (selectedRegistrationId && selectedPagePath) {
      void get().fetchPageContent(selectedRegistrationId, selectedPagePath);
      set({ isEditing: false, hasUnsavedChanges: false });
    }
  },
  setIsEditing: (editing) => set({ isEditing: editing }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open, ...(!open && { isDeleteWikiMode: false }) }),
  setIsDeleteWikiMode: (mode) => set({ isDeleteWikiMode: mode }),
  setIsCreateWikiDialogOpen: (open) => set({ isCreateWikiDialogOpen: open }),
}));

export default useWikiStore;
