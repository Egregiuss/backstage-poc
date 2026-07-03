# Backstage PoC

This repository contains a local Backstage application configured for a GitHub sign-in PoC. It includes:

- a Backstage frontend and backend
- GitHub OAuth authentication support
- a custom sign-in page that exposes both Guest and GitHub options
- example catalog entities and organizational data

## Prerequisites

- Node.js 22 or 24
- Yarn 4.4.1
- A GitHub OAuth App configured with a callback URL for your local Backstage instance

## Environment variables

Set the following values before starting the app:

```bash
export GITHUB_OAUTH_CLIENT_ID="your-github-client-id"
export GITHUB_OAUTH_CLIENT_SECRET="your-github-client-secret"
export GITHUB_OAUTH_LOGIN_BASE_URL="http://localhost:3000"
export GITHUB_TOKEN="your-github-token"  # optional for GitHub integrations
```

## Installation

From the repo root:

```bash
yarn install
```

## Start the app

```bash
yarn start
```

This starts both the frontend and backend locally:

- Frontend: http://localhost:3000
- Backend: http://localhost:7007

## Useful commands

### Stop the local Backstage processes

```bash
pkill -f 'backstage-cli repo start|workspace backend start|backstage-cli package start' || true
```

### Rebuild everything

```bash
yarn build:all
```

### Run TypeScript checks

```bash
yarn tsc
```

### Clean reinstall

```bash
rm -rf node_modules
rm -rf packages/**/node_modules
yarn install
yarn build:all
yarn start
```

## Authentication notes

The local auth setup is defined in [app-config.yaml](app-config.yaml). The GitHub provider is enabled for development and uses a username-based sign-in resolver so it can work even when GitHub profile email data is unavailable.

## Project structure

- [packages/app](packages/app) — frontend app shell and UI modules
- [packages/backend](packages/backend) — backend entrypoint and auth wiring
- [examples](examples) — sample catalog entities and org data
- [app-config.yaml](app-config.yaml) — local development configuration
- [app-config.production.yaml](app-config.production.yaml) — production example config

## Troubleshooting

If the backend refuses to start because port 7007 is already in use:

```bash
lsof -i :7007
kill <pid>
```

Then start the app again:

```bash
yarn start
```

