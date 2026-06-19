import Fastify from "fastify"
import { config } from "@/utils/config"
import { hostHeaderValidation } from "@modelcontextprotocol/fastify"
import { mcpRoutes } from "./routes/mcp"

const app = Fastify({ logger: true })

app.addHook("onRequest", hostHeaderValidation(["localhost", "127.0.0.1", "[::1]"]))

await app.register(mcpRoutes)

app.get("/health", async() => {
  return { status: "Ok", timestamp: new Date().toISOString() }
})

await app.listen({
  port: config.port,
  host: config.host,
})
