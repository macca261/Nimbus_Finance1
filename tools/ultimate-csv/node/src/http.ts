import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { detect } from './detect';
import { spawn } from 'node:child_process';

const app = Fastify({ logger: true });
app.register(multipart);

app.get('/healthz', async () => ({ ok: true }));

app.post('/detect', async (req, reply) => {
  const buf = await req.file({ limits: { files: 1 } }).then(async (p) => p ? Buffer.from(await p.toBuffer()) : Buffer.from(await req.raw.arrayBuffer()));
  const info = detect(buf);
  return reply.send(info);
});

app.post('/ingest', async (req, reply) => {
  // spawn our own CLI to reuse stream logic
  const lang = 'node'; // no-op
  const p = spawn(process.execPath, [new URL(import.meta.url).pathname.replace(/http\.js$/, 'cli.js'), 'ingest', '--input', '-'], { stdio: ['pipe', 'pipe', 'inherit'] });
  req.raw.pipe(p.stdin!);
  reply.header('content-type', 'application/x-ndjson');
  p.stdout.pipe(reply.raw);
});

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' });


