import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

export const aikaRouteRef = createRouteRef();

export const aikaPage = PageBlueprint.make({
  params: {
    path: '/aika',
    routeRef: aikaRouteRef,
    loader: async () => {
      const { AikaPage } = await import('./components/AikaPage');
      return <AikaPage />;
    },
  },
});

export const aikaPlugin = createFrontendPlugin({
  pluginId: 'aika',
  extensions: [aikaPage],
  routes: {
    root: aikaRouteRef,
  },
});
