import { NextFunction, Request, Response } from "express";
import { verificarToken } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; tenantId: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Falta token de autenticación" });
  }

  try {
    req.auth = verificarToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
