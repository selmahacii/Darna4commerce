import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ─── Types ───────────────────────────────────────────────
export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// ─── Config ──────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'darna-secret-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── Helpers ─────────────────────────────────────────────
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
}

function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

// ─── Middleware ──────────────────────────────────────────

/** Require valid JWT — attaches req.user or returns 401 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/** Require authenticated user with role 'admin' — authenticates + checks role */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;

    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/** Optional auth — attaches req.user if token present, continues without */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
  } catch {
    // Token invalid/expired — just continue without user
  }

  next();
}

// ─── Token generation ────────────────────────────────────
export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export { JWT_SECRET, JWT_EXPIRES_IN };
