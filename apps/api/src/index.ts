import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";
import { disconnectRedis } from "@repo/services/clients/redis";

import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
      });
      try { await disconnectRedis(); } catch {}
      setTimeout(() => { process.exit(0); }, 5000); // Force exit after 5s
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
