import type { RequestHandler } from "express";

let authMiddleware: RequestHandler;

export function setAuthMiddleware(middleware: RequestHandler) {
  authMiddleware = middleware;
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!authMiddleware) {
    return res.status(500).json({ message: "Auth middleware not initialized" });
  }
  return authMiddleware(req, res, next);
};
