import { env } from '../config/env.js';

export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

// Express 5 forwards rejected promises from async handlers to this function.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  const status = Number.isInteger(err.status) && err.status >= 400 ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message:
      status >= 500 && env.nodeEnv === 'production'
        ? 'An unexpected error occurred.'
        : err.message || 'Internal server error.',
    ...(err.details ? { details: err.details } : {}),
  });
}
