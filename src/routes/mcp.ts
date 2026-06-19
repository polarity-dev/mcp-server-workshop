import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node"
import { createMcpServer } from "@/components/createMcpServer"
import { methodNotAllowedResponse } from "@/utils/config"

export async function mcpRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST", "DELETE"],
    url: "/mcp",
    handler: async(request: FastifyRequest, reply: FastifyReply) => {
      if (request.method === "GET" || request.method === "DELETE") {
        return reply.status(405).send(methodNotAllowedResponse)
      }

      const mcpServer = createMcpServer()
      const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      })
      await mcpServer.connect(transport)

      reply.raw.on("close", () => {
        void Promise.all([transport.close(), mcpServer.close()])
      })

      await transport.handleRequest(request.raw, reply.raw, request.body)
    },
  })
}
