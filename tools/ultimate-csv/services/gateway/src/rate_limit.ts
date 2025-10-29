import { RateLimiterMemory } from 'rate-limiter-flexible';
import { FastifyReply, FastifyRequest } from 'fastify';

const limiter = new RateLimiterMemory({ points: 100, duration: 60 });

export async function rateLimit(req: FastifyRequest, reply: FastifyReply) {
  const key = (req.ip || 'anon') + ':' + (req.headers['x-forwarded-for'] || '');
  try {
    await limiter.consume(key);
  } catch {
    reply.code(429).send({ ok: false, error: 'rate_limited' });
  }
}


