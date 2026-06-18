import Fastify from "fastify"
import { config, protectedResourceMetadata } from "@/utils/config"
import { hostHeaderValidation } from "@modelcontextprotocol/fastify"
import { mcpRoutes } from "./routes/mcp"
import authMiddleware from "@/middleware/auth"

const app = Fastify({ logger: true })

app.addHook("onRequest", hostHeaderValidation(["localhost", "127.0.0.1", "[::1]"]))

await app.register(mcpRoutes)
await app.register(authMiddleware)

app.get("/health", async() => {
  return { status: "Ok", timestamp: new Date().toISOString() }
})

// RFC 9728 §3.1 — Path-specific Protected Resource Metadata
// Clients MUST try the path-specific well-known URI first when the resource
// identifier has a path component (e.g. /mcp).
app.get("/.well-known/oauth-protected-resource/mcp", async() => {
  return protectedResourceMetadata
})

// Root fallback — some clients may fall back to the root well-known URI
app.get("/.well-known/oauth-protected-resource", async() => {
  return protectedResourceMetadata
})

await app.listen({
  port: config.port,
  host: config.host,
})
