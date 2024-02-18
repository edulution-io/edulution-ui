import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import i18n from "@/i18n";
import useLanguage from "@/store/useLanguage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {FileSharing} from "@/pages/FileSharing/FileSharing.tsx";
import {HomePage} from "@/pages/Home";

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/file-sharing" element={<FileSharing />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
