import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { config } from "./config.js";

interface AuthenticatedUser {
  id: string;
  email?: string;
  displayName?: string;
  claims: JWTPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

const getJwks = () => {
  if (!config.authJwksUri) {
    throw new Error("Missing required environment variable: AUTH_JWKS_URI");
  }

  jwks ??= createRemoteJWKSet(new URL(config.authJwksUri));
  return jwks;
};

const readStringClaim = (claims: JWTPayload, name: string) => {
  const value = claims[name];
  return typeof value === "string" ? value : undefined;
};

const readEmail = (claims: JWTPayload) => {
  const emails = claims.emails;

  if (Array.isArray(emails) && typeof emails[0] === "string") {
    return emails[0];
  }

  return (
    readStringClaim(claims, "email") ??
    readStringClaim(claims, "preferred_username") ??
    readStringClaim(claims, "upn")
  );
};

const toAuthenticatedUser = (claims: JWTPayload): AuthenticatedUser => {
  const id = readStringClaim(claims, "oid") ?? claims.sub;

  if (!id) {
    throw new Error("Authenticated token does not include a stable user id");
  }

  return {
    id,
    email: readEmail(claims),
    displayName: readStringClaim(claims, "name"),
    claims,
  };
};

const bearerTokenFromRequest = (request: Request) => {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorization.slice("Bearer ".length).trim();
};

export async function attachAuthenticatedUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!config.authRequired) {
    next();
    return;
  }

  const token = bearerTokenFromRequest(request);

  if (!token) {
    response.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      audience: config.authAudience,
      issuer: config.authIssuer,
    });

    request.user = toAuthenticatedUser(payload);
    next();
  } catch (error) {
    response.status(401).json({
      error: error instanceof Error ? error.message : "Invalid bearer token",
    });
  }
}

export function requireAuthenticatedUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!config.authRequired || request.user) {
    next();
    return;
  }

  response.status(401).json({ error: "Authentication is required" });
}
