import { HttpError } from '../utils/HttpError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      'Validation failed.',
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  req.body = result.data;
  next();
};
