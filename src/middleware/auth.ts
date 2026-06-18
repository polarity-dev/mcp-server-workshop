import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import fp from "fastify-plugin"
import { config } from "@/utils/config"

const unauthenticatedReply = (reply: FastifyReply, message: string) => {
  // RFC 9728 §5.1 — Point the client to our Protected Resource Metadata
  // so it can discover which Authorization Server to use.
  reply.header(
    "WWW-Authenticate",
    `Bearer resource_metadata="${config.baseUrl}/.well-known/oauth-protected-resource/mcp"`,
  )
  return reply.status(401).send({ error: message })
}

async function authMiddleware(fastify: FastifyInstance) {
  fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
    const publicRoutes = ["/health", "/.well-known"]
    if (publicRoutes.some(route => request.url.startsWith(route))) {
      return
    }

    const accessToken = request.headers.authorization?.replace("Bearer ", "")
    if (!accessToken) {
      return unauthenticatedReply(reply, "unauthorized")
    }

    // TODO: verify JWT here
    return unauthenticatedReply(reply, "invalid or expired token")
  })
}

export default fp(authMiddleware)
