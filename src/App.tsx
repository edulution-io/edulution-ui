import { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Router from '@/routes/Router';
import i18n from '@/i18n';
import useLanguage from '@/store/useLanguage';
import { theme } from '@/themes';

const queryClient = new QueryClient();

const App = () => {
  const { lang } = useLanguage();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Router />
      </ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
