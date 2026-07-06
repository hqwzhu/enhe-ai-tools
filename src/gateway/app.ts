import Fastify from "fastify";
import { registerModelRoutes } from "./models";

export function buildGatewayApp() {
  const app = Fastify({
    logger: false
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "enhe-api-gateway"
  }));

  registerModelRoutes(app);

  return app;
}
