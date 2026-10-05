import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { AikaService } from './services/AikaService';

describe('createRouter', () => {
  let app: express.Express;

  beforeEach(async () => {
    const aikaService = {
      ask: jest.fn().mockResolvedValue('Test answer'),
    } as unknown as AikaService;

    const router = await createRouter({ aikaService });
    app = express();
    app.use(router);
  });

  it('should return health ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return an answer', async () => {
    const response = await request(app)
      .post('/ask')
      .send({ question: 'Who owns payment-service?' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('answer');
  });
});
