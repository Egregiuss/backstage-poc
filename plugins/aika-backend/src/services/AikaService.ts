import OpenAI from 'openai';
import { CatalogApi } from '@backstage/catalog-client';
import { LoggerService } from '@backstage/backend-plugin-api';

export class AikaService {
  private openai: OpenAI;
  private model: string;
  private catalogApi: CatalogApi;
  private logger: LoggerService;

  constructor({
    apiKey,
    model,
    catalogApi,
    logger,
  }: {
    apiKey: string;
    model: string;
    catalogApi: CatalogApi;
    logger: LoggerService;
  }) {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.catalogApi = catalogApi;
    this.logger = logger;
  }

  async ask(question: string): Promise<string> {
    const tools = [
      {
        type: 'function' as const,
        name: 'find_catalog_entity',
        description: 'Find a Backstage entity by name',
        strict: true,
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
    ];

    let response = await this.openai.responses.create({
      model: this.model,
      input: question,
      tools,
    });

    while (true) {
      const calls = response.output.filter(
        (i): i is OpenAI.Responses.ResponseFunctionToolCall =>
          i.type === 'function_call',
      );

      if (!calls.length) return response.output_text;

      const outputs: any[] = [];

      for (const call of calls) {
        const args = JSON.parse(call.arguments);
        this.logger.info(`Calling tool: ${call.name} with args: ${JSON.stringify(args)}`);

        const result = await this.catalogApi.getEntities({
          filter: { 'metadata.name': args.name },
        });

        outputs.push({
          type: 'function_call_output',
          call_id: call.call_id,
          output: JSON.stringify(result),
        });
      }

      response = await this.openai.responses.create({
        model: this.model,
        previous_response_id: response.id,
        input: outputs,
      });
    }
  }
}
