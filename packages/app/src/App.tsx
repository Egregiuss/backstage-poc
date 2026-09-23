import { createApp } from '@backstage/frontend-defaults';
import authPlugin from '@backstage/plugin-auth';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { signInPageModule } from './modules/signInPage';

const app = createApp({
  features: [authPlugin, catalogPlugin, navModule, signInPageModule],
});

export default app;
