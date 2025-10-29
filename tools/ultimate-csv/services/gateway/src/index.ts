import Fastify from 'fastify';
import { rateLimit } from './rate_limit';
import { request } from 'undici';

const app = Fastify({ logger: true });

app.get('/healthz', async () => ({ ok: true }));

app.post('/detect', { preHandler: rateLimit }, async (req, reply) => {
  const lang = (req.query as any)?.lang || 'node';
  const url = lang === 'python' ? 'http://python:3002/detect' : 'http://node:3001/detect';
  const { body } = await request(url, { method: 'POST', body: req.raw });
  reply.header('content-type', 'application/json');
  return reply.send(body);
});

app.post('/ingest', { preHandler: rateLimit }, async (req, reply) => {
  const q = req.query as any;
  const lang = q?.lang || 'node';
  const target = lang === 'python' ? 'http://python:3002/ingest' : 'http://node:3001/ingest';
  const { body } = await request(target + '?' + new URLSearchParams(q as any).toString(), { method: 'POST', body: req.raw });
  reply.header('content-type', 'application/x-ndjson');
  return reply.send(body);
});

const port = Number(process.env.PORT || 8080);
app.listen({ port, host: '0.0.0.0' });


