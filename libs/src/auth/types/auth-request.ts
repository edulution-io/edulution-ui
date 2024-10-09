import { type ProcessResourceOwnerPasswordCredentialsArgs } from 'oidc-client-ts';

type AuthRequestArgs = ProcessResourceOwnerPasswordCredentialsArgs & {
  grant_type: string;
};

export default AuthRequestArgs;
