import express from 'express';
import Router from 'express-promise-router';
import { AikaService } from './services/AikaService';

export async function createRouter({
  aikaService,
}: {
  aikaService: AikaService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  router.post('/ask', async (req, res) => {
    const { question } = req.body;
    const answer = await aikaService.ask(question);
    res.json({ question, answer });
  });

  return router;
}
