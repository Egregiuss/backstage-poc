# GitHub Sign-In Fix Summary

## Purpose
This document records the exact Backstage changes that enabled GitHub sign-in locally by registering the GitHub auth provider in the backend, exposing GitHub on the frontend sign-in page, and configuring the auth resolver to avoid requiring an email from the GitHub profile.

---

## Changed files

- `app-config.yaml`
- `app-config.production.yaml`
- `examples/org.yaml`
- `package.json`
- `packages/app/src/App.tsx`
- `packages/app/src/modules/signInPage.tsx` (new)
- `packages/backend/src/index.ts`
- `packages/backend/src/auth.ts` (new)
- `yarn.lock`

### New untracked artifacts

- `examples/users.yaml`
- `examples/users/`
- `packages/app/src/examples/`
- `packages/app/src/modules/signInPage.tsx`
- `packages/backend/src/auth.ts`

---

## Key configuration that worked

### `app-config.yaml`
The working development auth configuration is:

```yaml
auth:
  environment: development
  providers:
    guest:
      dangerouslyAllowOutsideDevelopment: true
      userEntityRef: user:default/backstage-guest
      ownershipEntityRefs: [group:default/guest-family]
    github:
      development:
        clientId: ${GITHUB_OAUTH_CLIENT_ID}
        clientSecret: ${GITHUB_OAUTH_CLIENT_SECRET}
        audience: ${GITHUB_OAUTH_LOGIN_BASE_URL}
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
              dangerouslyAllowSignInWithoutUserInCatalog: true
```

This is the critical working code: the GitHub provider is enabled for development, and the sign-in flow uses `usernameMatchingUserEntityName` instead of relying on a profile email.

The same values were also added to your environment variables as:

```bash
GITHUB_OAUTH_CLIENT_ID
GITHUB_OAUTH_CLIENT_SECRET
GITHUB_OAUTH_LOGIN_BASE_URL
```

---

## Backend changes

### `packages/backend/src/index.ts`
The backend now registers the GitHub auth backend module and the auth backend itself:

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-notifications'));

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'));

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// search plugin
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// mcp actions plugin
backend.add(import('@backstage/plugin-mcp-actions-backend'));

backend.start();
```

### `packages/backend/src/auth.ts`
New helper file exposing the GitHub authenticator for backend registration:

```ts
import { githubAuthenticator } from '@backstage/plugin-auth-backend-module-github-provider';

export const githubProviderConfig = {
  authenticator: githubAuthenticator,
};
```

---

## Frontend changes

### `packages/app/src/App.tsx`
The app now imports auth support and the custom sign-in page module:

```ts
import { createApp } from '@backstage/frontend-defaults';
import authPlugin from '@backstage/plugin-auth';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { signInPageModule } from './modules/signInPage';

const app = createApp({
  features: [authPlugin, catalogPlugin, navModule, signInPageModule],
});

export default app;
```

### `packages/app/src/modules/signInPage.tsx`
The sign-in page explicitly exposes both guest and GitHub login options:

```tsx
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
```

---

## Example entities

### `examples/org.yaml`
This file was extended to add a `Group` and a `Location` that references `./users.yaml`:

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: poc
  description: Pipelines of Code
spec:
  type: root
  profile:
    displayName: POC
  children: []
---
apiVersion: backstage.io/v1alpha1
kind: Location
metadata:
  name: groups-users-locations
  description: All groups & users
spec:
  targets:
    - ./users.yaml
```

This allows Backstage to load user/group example data from the new `users.yaml` file.

---

## Package metadata changes

### `package.json`
Added runtime dependencies required for the auth and frontend changes:

```json
"dependencies": {
  "@backstage/core-app-api": "^1.20.2",
  "@backstage/core-components": "^0.18.11",
  "@backstage/plugin-auth-backend": "^0.29.1",
  "@backstage/plugin-auth-backend-module-github-provider": "^0.5.4"
}
```

Also kept `packageManager` at `yarn@4.4.1`.

---

## Production config note

### `app-config.production.yaml`
The file was updated to include a commented sample GitHub auth configuration for production, but this change is a documentation/example block and not active unless uncommented.

---

## Restore instructions

If you want to discard these working changes and restore the files to the current HEAD state, run:

```bash
git restore app-config.production.yaml app-config.yaml examples/org.yaml package.json packages/app/src/App.tsx packages/backend/src/index.ts yarn.lock
```

If you also want to remove the new untracked files, use:

```bash
rm -rf examples/users.yaml examples/users packages/app/src/examples packages/app/src/modules/signInPage.tsx packages/backend/src/auth.ts
```

---

## Useful terminal scripts

### Stop the Backstage service

```bash
pkill -f 'backstage-cli repo start|workspace backend start|backstage-cli package start' || true
```

If you want to target the process by port instead:

```bash
lsof -i :7007
kill <pid>
```

### Start Backstage

```bash
yarn start
```

### Install dependencies

```bash
yarn install
```

### Build the repo

```bash
yarn build:all
```

### Full clean rebuild flow

```bash
rm -rf node_modules
rm -rf packages/**/node_modules
yarn install
yarn build:all
yarn start
```

### Recommended restart flow after config changes

```bash
pkill -f 'backstage-cli repo start|workspace backend start|backstage-cli package start' || true
yarn start
```
