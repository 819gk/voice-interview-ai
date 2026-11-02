import rateLimit from 'express-rate-limit';

const base = { standardHeaders: 'draft-7', legacyHeaders: false };

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 300,
  message: { message: 'Too many requests. Please try again later.' },
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 30,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

// Every call to these endpoints costs an LLM request.
export const aiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60_000,
  limit: 80,
  message: { message: 'AI request limit reached. Please wait a few minutes.' },
});
