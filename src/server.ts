import Fastify from "fastify"
import { config } from "@/utils/config"

const app = Fastify({ logger: true })

app.get("/health", async() => {
  return { status: "Ok", timestamp: new Date().toISOString() }
})

await app.listen({
  port: config.port,
  host: config.host,
})
