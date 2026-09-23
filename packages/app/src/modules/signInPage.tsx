import { SignInPage } from '@backstage/core-components';
import {
  githubAuthApiRef,
  type SignInPageProps,
} from '@backstage/core-plugin-api';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import appPlugin from '@backstage/plugin-app';

const GitHubSignInPage = (props: SignInPageProps) => (
  <SignInPage
    {...props}
    providers={[
      'guest',
      {
        id: 'github',
        title: 'GitHub',
        message: 'Sign in with GitHub',
        apiRef: githubAuthApiRef,
      },
    ]}
  />
);

export const signInPageModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    appPlugin.getExtension('sign-in-page:app').override({
      params: {
        loader: async () => GitHubSignInPage,
      },
    }),
  ],
});
