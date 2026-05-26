import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";
import { clerkWebhookRouter } from "./webhooks/clerk";

import { env } from "./env";

export const app = express();

// CORS — open in dev, restricted in production
if (env.NODE_ENV !== "prod") {
  app.use(cors({ origin: "*" }));
} else {
  app.use(cors({ origin: env.BASE_URL }));
}

app.use(express.json());

// Clerk webhooks (must be registered before auth middleware)
app.use("/webhooks", clerkWebhookRouter);

// Health check
app.get("/", (req, res) => {
  return res.json({
    name: "CanvasForms API",
    version: "1.0.0",
    status: "running",
    docs: `${env.BASE_URL}/docs`,
  });
});

app.get("/health", (req, res) => {
  return res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// OpenAPI spec
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "CanvasForms API",
  description: `
## Overview

CanvasForms is a visual form builder where creators design dynamic forms on an infinite canvas and publish them as clean, finite screens for respondents.

## Authentication

All creator endpoints require a Bearer token (Clerk JWT) in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <clerk_jwt_token>
\`\`\`

Alternatively, use an API key for programmatic access:

\`\`\`
Authorization: Bearer sk_live_<your_api_key>
\`\`\`

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public submission | 60 req | 1 minute |
| API key | 10,000 req | 1 hour |
| Auth endpoints | 10 req | 1 minute |

Rate limit headers are included in every response:
- \`X-RateLimit-Limit\`
- \`X-RateLimit-Remaining\`
- \`X-RateLimit-Reset\`

## Demo Credentials

- **Email:** admin@canvasforms.io
- **Plan:** Pro
- **API Key:** Generated via the dashboard

## Base URL

\`${env.BASE_URL}/api\`
  `.trim(),
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

// Scalar API Reference UI
app.use(
  "/docs",
  apiReference({
    url: "/openapi.json",
    theme: "kepler",
    spec: {
      url: "/openapi.json",
    },
    metaData: {
      title: "CanvasForms API Docs",
      description: "Interactive API documentation for CanvasForms",
    },
  }),
);

logger.info(`API docs available at ${env.BASE_URL}/docs`);

// tRPC via OpenAPI (REST-style endpoints)
app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

// tRPC native protocol (for frontend React Query client)
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

export default app;
