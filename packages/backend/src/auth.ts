import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';

export const githubProviderConfig = {
  authenticator: githubAuthenticator,
};