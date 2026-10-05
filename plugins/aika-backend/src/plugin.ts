import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { AikaService } from './services/AikaService';
import { createRouter } from './router';

export const aikaPlugin = createBackendPlugin({
  pluginId: 'aika',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, discovery, httpRouter }) {
        const catalogApi = new CatalogClient({ discoveryApi: discovery });

        const aikaService = new AikaService({
          apiKey: config.getString('aika.openaiApiKey'),
          model: config.getString('aika.model'),
          catalogApi,
          logger,
        });

        httpRouter.use(await createRouter({ aikaService }));
      },
    });
  },
});
