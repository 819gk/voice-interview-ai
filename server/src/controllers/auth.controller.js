import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.'));

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60),
  email,
  // bcrypt only uses the first 72 bytes of a password.
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.').max(72),
});

// Used so a login for an unknown email takes about as long as a real one.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const signToken = (userId) =>
  jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: env.jwtExpiresIn });

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;

  try {
    user = await User.create({ name, email, passwordHash });
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, 'An account with this email already exists.');
    }
    throw error;
  }

  res.status(201).json({ token: signToken(user.id), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  res.json({ token: signToken(user.id), user });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new HttpError(401, 'Account no longer exists.');
  }

  res.json({ user });
}
