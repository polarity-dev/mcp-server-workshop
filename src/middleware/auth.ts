import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import fp from "fastify-plugin"
import { config, keycloakUrls } from "@/utils/config"
import { createRemoteJWKSet, jwtVerify } from "jose"
import { assertString } from "@/utils/types"
import { AuthInfo } from "@modelcontextprotocol/server"

const jwkSet = createRemoteJWKSet(
  new URL(keycloakUrls.jwks),
  {
    cacheMaxAge: 60_000,
  },
)

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

    try {
      const { payload } = await jwtVerify(accessToken, jwkSet, {
        issuer: keycloakUrls.issuer,
        audience: config.keycloak.clientId,
        clockTolerance: 30,
      })

      assertString(payload.azp)

      request.raw.auth = {
        token: accessToken,
        clientId: payload.azp,
        scopes: typeof payload.scope === "string"
          ? payload.scope.split(" ").filter(Boolean)
          : [],
        expiresAt: payload.exp,
        extra: {
          sub: payload.sub,
          email: payload.email,
          preferred_username: payload.preferred_username,
          name: payload.name,
        },
      } satisfies AuthInfo
    } catch {
      return unauthenticatedReply(reply, "invalid or expired token")
    }
  })
}

export default fp(authMiddleware)
