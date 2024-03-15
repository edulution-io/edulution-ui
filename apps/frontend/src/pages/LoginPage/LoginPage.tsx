import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Button } from '../../components/shared/Button';

const LoginPage: React.FC = () => {
  const auth = useAuth();

  // eslint-disable-next-line default-case
  switch (auth.activeNavigator) {
    case 'signinSilent':
      return <div>Signing you in...</div>;
    case 'signoutRedirect':
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  const handleLogin = async () => {
    try {
      await auth.signinPopup();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Button
        variant="btn-collaboration"
        onClick={handleLogin}
      >
        Log in
      </Button>
    </div>
  );
};

export default LoginPage;
