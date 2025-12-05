import { Route } from 'react-router-dom';
import AiAssistPage from '@/pages/AiAssist/AiAssistPage';
import APPS from '@libs/appconfig/constants/apps';

const getAiAssistRoutes = () => [
  <Route
    key={APPS.AI_ASSIST}
    path={APPS.AI_ASSIST}
  >
    <Route
      index
      element={<AiAssistPage />}
    />

    <Route
      path=":chatId"
      element={<AiAssistPage />}
    />
  </Route>,
];

export default getAiAssistRoutes;
