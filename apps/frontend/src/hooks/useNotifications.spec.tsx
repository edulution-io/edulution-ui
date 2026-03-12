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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

const {
  mockGetMails,
  mockUpdateOpenSurveys,
  mockGetConferences,
  mockSetConferences,
  mockGetAppConfigs,
  mockGetPublicAppConfigs,
  mockAddBulletinBoardNotification,
  mockAddRoomHistoryEntry,
  mockFetchUnreadCount,
  mockFetchNotifications,
  sseListeners,
} = vi.hoisted(() => ({
  mockGetMails: vi.fn(),
  mockUpdateOpenSurveys: vi.fn(),
  mockGetConferences: vi.fn(),
  mockSetConferences: vi.fn(),
  mockGetAppConfigs: vi.fn(),
  mockGetPublicAppConfigs: vi.fn(),
  mockAddBulletinBoardNotification: vi.fn(),
  mockAddRoomHistoryEntry: vi.fn(),
  mockFetchUnreadCount: vi.fn(),
  mockFetchNotifications: vi.fn(),
  sseListeners: new Map<string, (e: MessageEvent) => void>(),
}));

vi.mock('@/hooks/useLdapGroups', () => ({
  default: () => ({ isSuperAdmin: false, isAuthReady: true, ldapGroups: [] }),
}));
vi.mock('@/hooks/useIsAppActive', () => ({ default: () => true }));
vi.mock('@/hooks/useDockerContainerEvents', () => ({ default: () => {} }));
vi.mock('@/hooks/useSseHeartbeatMonitor', () => ({ default: () => {} }));
vi.mock('@/hooks/useDownloadProgressToast', () => ({ default: () => {} }));
vi.mock('@/hooks/useFileOperationProgressToast', () => ({ default: () => {} }));
vi.mock('@/pages/FileSharing/hooks/useFileOperationProgress', () => ({ default: () => {} }));

vi.mock('@/pages/Mail/useMailsStore', () => ({
  default: () => ({ getMails: mockGetMails }),
}));
vi.mock('@/pages/ConferencePage/useConferenceStore', () => ({
  default: () => ({
    conferences: [],
    getConferences: mockGetConferences,
    setConferences: mockSetConferences,
  }),
}));
vi.mock('@/pages/Surveys/Tables/useSurveysTablesPageStore', () => ({
  default: () => ({ updateOpenSurveys: mockUpdateOpenSurveys }),
}));
vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: () => ({
    getAppConfigs: mockGetAppConfigs,
    getPublicAppConfigs: mockGetPublicAppConfigs,
    appConfigs: [],
  }),
}));
vi.mock('@/pages/BulletinBoard/useBulletinBoardStore', () => ({
  default: () => ({ addBulletinBoardNotification: mockAddBulletinBoardNotification }),
}));
vi.mock('@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore', () => ({
  default: () => ({ addRoomHistoryEntry: mockAddRoomHistoryEntry }),
}));
vi.mock('@/pages/FileSharing/useFileSharingStore', () => ({
  default: () => ({ fileOperationProgress: [] }),
}));
vi.mock('@/store/useNotificationStore', () => {
  const storeState = {
    fetchUnreadCount: mockFetchUnreadCount,
    fetchNotifications: mockFetchNotifications,
    isSheetOpen: false,
  };
  const hook = () => storeState;
  hook.getState = () => storeState;
  return { default: hook };
});

vi.mock('@/hooks/useSseEventListener', () => ({
  default: (eventType: string | string[], handler: (e: MessageEvent) => void, options?: { enabled: boolean }) => {
    if (options?.enabled === false) return;
    const types = Array.isArray(eventType) ? eventType : [eventType];
    types.forEach((type) => {
      sseListeners.set(type, handler);
    });
  },
}));

import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { type ReactNode } from 'react';
import { toast } from 'sonner';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useNotifications from './useNotifications';

const testI18n = i18n.createInstance();
testI18n.init({ lng: 'cimode', resources: {}, interpolation: { escapeValue: false } });

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

const createMessageEvent = (type: string, data: unknown): MessageEvent =>
  Object.assign(new Event(type), { data: JSON.stringify(data) }) as MessageEvent;

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sseListeners.clear();
  });

  describe('initial load', () => {
    it('calls getMails, updateOpenSurveys, getConferences, and fetchUnreadCount on mount', () => {
      renderHook(() => useNotifications(), { wrapper });

      expect(mockGetMails).toHaveBeenCalled();
      expect(mockUpdateOpenSurveys).toHaveBeenCalled();
      expect(mockGetConferences).toHaveBeenCalled();
      expect(mockFetchUnreadCount).toHaveBeenCalled();
    });
  });

  describe('SSE event handlers', () => {
    it('registers listener for MAIL_NEW_MAIL and calls getMails with toast', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.MAIL_NEW_MAIL);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.MAIL_NEW_MAIL, { newMailCount: 3 }));

      expect(mockGetMails).toHaveBeenCalledTimes(2);
      expect(toast.info).toHaveBeenCalled();
    });

    it('registers listener for MAIL_FLAGS_CHANGED and calls getMails', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.MAIL_FLAGS_CHANGED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.MAIL_FLAGS_CHANGED, {}));

      expect(mockGetMails).toHaveBeenCalledTimes(2);
    });

    it('registers listener for CONFERENCE_CREATED and adds conference', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.CONFERENCE_CREATED);
      expect(handler).toBeDefined();

      const newConference = { meetingID: 'new-conf', isRunning: true };
      handler!(createMessageEvent(SSE_MESSAGE_TYPE.CONFERENCE_CREATED, newConference));

      expect(mockSetConferences).toHaveBeenCalledWith([newConference]);
    });

    it('registers listener for SURVEY events and calls updateOpenSurveys', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.SURVEY_CREATED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.SURVEY_CREATED, {}));

      expect(mockUpdateOpenSurveys).toHaveBeenCalledTimes(2);
    });

    it('registers listener for BULLETIN_UPDATED and calls addBulletinBoardNotification', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.BULLETIN_UPDATED);
      expect(handler).toBeDefined();

      const bulletin = { id: 'b1', title: 'Test' };
      handler!(createMessageEvent(SSE_MESSAGE_TYPE.BULLETIN_UPDATED, bulletin));

      expect(mockAddBulletinBoardNotification).toHaveBeenCalledWith(bulletin);
    });

    it('registers listener for TLDRAW_SYNC_ROOM_LOG_MESSAGE and calls addRoomHistoryEntry', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.TLDRAW_SYNC_ROOM_LOG_MESSAGE);
      expect(handler).toBeDefined();

      const entry = { id: 'entry-1', type: 'log' };
      handler!(createMessageEvent(SSE_MESSAGE_TYPE.TLDRAW_SYNC_ROOM_LOG_MESSAGE, entry));

      expect(mockAddRoomHistoryEntry).toHaveBeenCalledWith(entry);
    });

    it('registers listener for APPCONFIG_UPDATED and refreshes configs', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.APPCONFIG_UPDATED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.APPCONFIG_UPDATED, {}));

      expect(mockGetAppConfigs).toHaveBeenCalled();
      expect(mockGetPublicAppConfigs).toHaveBeenCalled();
    });

    it('registers listener for NOTIFICATION_INBOX_UPDATED and calls fetchUnreadCount', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.NOTIFICATION_INBOX_UPDATED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.NOTIFICATION_INBOX_UPDATED, {}));

      expect(mockFetchUnreadCount).toHaveBeenCalledTimes(2);
    });

    it('registers listener for MAIL_THEME_UPDATED and shows toast', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATED, {}));

      expect(toast.info).toHaveBeenCalled();
    });

    it('registers listener for MAIL_THEME_UPDATE_FAILED and shows error toast', () => {
      renderHook(() => useNotifications(), { wrapper });

      const handler = sseListeners.get(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATE_FAILED);
      expect(handler).toBeDefined();

      handler!(createMessageEvent(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATE_FAILED, {}));

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
