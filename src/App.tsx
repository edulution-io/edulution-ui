import { useEffect } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileSharing from "@/pages/FileSharing/FileSharing.tsx";
import HomePage from "@/pages/Home";
const theme = extendTheme({
  colors: {
    green: {
      500: '#3E76AC',
    },
    blue: {
      500: '#628AB9',
    },
    brown: {
      500: '#393939',
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
});

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/fileSharing" element={<FileSharing />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
