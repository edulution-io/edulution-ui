import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import ChatPage from '@/pages/Chat/ChatPage';
import ChatConversation from '@/pages/Chat/ChatConversation';
import { CHAT_GROUPS_LOCATION } from '@libs/chat/chatPaths';

const getChatRoutes = () => [
  <Route
    key={APPS.CHAT}
    path={APPS.CHAT}
  >
    <Route
      index
      element={
        <Navigate
          to={CHAT_GROUPS_LOCATION}
          replace
        />
      }
    />

    <Route
      path=":type"
      element={<ChatPage />}
    >
      <Route
        path=":chatId"
        element={<ChatConversation />}
      />
    </Route>
  </Route>,
];

export default getChatRoutes;
