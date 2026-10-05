import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export class AikaApi {
  constructor(
    private discoveryApi: DiscoveryApi,
    private fetchApi: FetchApi,
  ) {}

  async ask(question: string): Promise<{ question: string; answer: string }> {
    const baseUrl = await this.discoveryApi.getBaseUrl('aika');

    const res = await this.fetchApi.fetch(`${baseUrl}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
      headers: { 'Content-Type': 'application/json' },
    });

    return res.json();
  }
}
